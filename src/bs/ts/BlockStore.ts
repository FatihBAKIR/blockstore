import { Config } from "./Config";
import { IKVStore } from "./IKVStore";
import { GenericKVStore } from "./GenericKVStore";
import { Payload, Operation, Put, Upd, Del, OpType } from "./Operation";
import { Block, MineBlock, ValidateBlock, ValidBlock, Header, OriginHash } from "./Block"
import { BlockChain } from "./BlockChain";
import { Cluster, Replica } from "./Cluster";
import * as winston from "winston";

class PendingPool
{
    private ops: Array<Operation>;

    constructor()
    {
        this.ops = new Array<Operation>();
    }

    Front()
    {
        return this.ops[0];
    }

    PopFront()
    {
        return <Operation>this.ops.shift();
    }

    PushBack(op: Operation)
    {
        this.ops.push(op);
    }

    PushFront(op: Operation)
    {
        this.ops.unshift(op);
    }

    Length()
    {
        return this.ops.length;
    }

    Empty()
    {
        return this.Length() == 0;
    }
}

function Difference(prev: Array<ValidBlock<Payload>>, next: Array<ValidBlock<Payload>>)
{
    const ops = new Map<number, Operation>();
    for (const blk of prev)
    {
        for (const op of blk.payload.ops)
        {
            ops.set(op.id * 10000 + op.owner, op);
        }
    }

    for (const blk of prev)
    {
        for (const op of blk.payload.ops)
        {
            if (ops.has(op.id * 10000 + op.owner))
            {
                ops.delete(op.id * 10000 + op.owner);
            }
        }
    }
    const res = new Array<Operation>();
    for (const op of ops.values())
    {
        res.push(op);
    }
    return res;
}

function Apply(kv: IKVStore, op: Operation)
{
    switch(op.op.type)
    {
        case OpType.Put:
        {
            const oper = <Put>op.op;
            kv.Put(oper.key, oper.val);
        }
        break;
        case OpType.Upd:
        {
            const oper = <Upd>op.op;
            kv.Update(oper.key, oper.val);
        }
        break;
        case OpType.Del:
        {
            const oper = <Del>op.op;
            kv.Delete(oper.key);
        }
        break;
    }
}

export class BlockStore implements IKVStore {
    private next_id = 1;
    Get(key: string) : string {
        return this.kv.Get(key);
    }

    Put(key: string, val: string, time: number = Date.now()) : boolean 
    {
        this.pool.PushBack(new Operation(1, this.next_id++, new Put(key, val), time));
        return true;
    }

    Update(key: string, val: string, time: number = Date.now()) : boolean {
        this.pool.PushBack(new Operation(1, this.next_id++, new Upd(key, val), time));
        return true;
    }

    Delete(key: string, time: number = Date.now()) : boolean {
        this.pool.PushBack(new Operation(1, this.next_id++, new Del(key), time));
        return true;
    }

    constructor(config: Config, port: number)
    {
        this.config = config;
        this.kv = new GenericKVStore;
        this.chain = new BlockChain<Payload>();
        const self = this;
        
        this.cluster = new Cluster(port, async(begin, end) => {
            return self.HandleQuery(begin, end);
        });
        
        if (port != 8080)
            this.cluster.AddReplica("127.0.0.1", 8080);
        if (port != 8081)
            this.cluster.AddReplica("127.0.0.1", 8081);
        if (port != 8082)
            this.cluster.AddReplica("127.0.0.1", 8082);
          
        this.pool = new PendingPool;
        this.config = config;
        this.logger = new winston.Logger({
            transports: [
                new winston.transports.Console
            ]
        });
        this.cluster.AttachBlockHandler(async(x, from) => {
            return await self.RecvBlocks(x, from);
        });
    }

    async Flush()
    {
        const blk = await this.MakeBlock();
        const p = this.chain.Append(blk);
        const r = this.cluster.Replicate(blk);
        for (const op of blk.payload.ops)
        {
            this.Commit(op);
        }
        await [p, r];
    }

    Pending() : boolean
    {
        return !this.pool.Empty();
    }

    private async MakeBlock(count: number = this.config.blkMaxOperationCount)
    {
        const pl = new Payload;
        while (pl.ops.length < count && !this.pool.Empty())
        {
            pl.Add(this.pool.PopFront());
        }

        let tailHash = OriginHash;
        if (this.chain.Tail())
        {
            tailHash = this.chain.Tail().hash;
        }
        const header = new Header(10, tailHash, Date.now());
        const block = new Block(header, pl);

        const valid = await MineBlock(block);
        return valid;
    }

    private async HandleQuery(begin: string, end: string) : Promise<ValidBlock<Payload>[]>
    {
        const slice = this.chain.Slice(begin); //begin not included
        return slice;
    }

    private Commit(op: Operation)
    {
        this.logger.info(`Commit Attempt: ${JSON.stringify(op.op)}`);
        Apply(this.kv, op);
    }

    /**
     * This handler is called when a fork in the blockchain
     * is detected
     * 
     * @param blk forked off part of the other chain
     */
    private async HandleFork(fork: ValidBlock<Payload>[])
    {
        /**
         * 1.   find the exact node where we forked
         * 2.   decide which fork to stay, other or this
         * 3.   if the other one's chosen, starting after the
         *      forked block, put any operation that isn't
         *      in the other fork back to the pending pool
         * 4.   if the current one's chosen, do nothing
         */

        const tail = this.chain.Slice(fork[0].header.prevHash);
        if (tail.length > fork.length)
        {
            // our chain is longer

            this.logger.info("our fork is longer");
            const diff = Difference(fork, tail); // ops in fork but not in tail
            for (const op of diff)
            {
                this.pool.PushBack(op);
            }
            
            return;
        }

        this.logger.info("their fork is longer or eq");

        const diff = Difference(tail, fork); // ops in tail but not in fork
        for (const op of diff)
        {
            this.pool.PushBack(op);
        }
        
        for(let i = 0; i < tail.length; ++i)
        {
            this.chain.PopBack();
        }

        for (const blk of fork)
        {
            this.chain.Append(blk);
        }

        this.kv = new GenericKVStore;
        for (const blk of this.chain.Slice(OriginHash))
        {
            for (const op of blk.payload.ops)
            {
                this.Commit(op);
            }
        }
    }

    private async RecvBlocks(blks: ValidBlock<Payload>[], from: Replica) : Promise<boolean>
    {
        let tHash = OriginHash;
        if (this.chain.Tail())
        {
            tHash = this.chain.Tail().hash;
        }
        if (blks[0].header.prevHash == tHash)
        {
            // perfect!

            this.logger.info("perfect");
            for (const blk of blks)
            {
                await this.chain.Append(blk);
                for (const op of blk.payload.ops)
                {
                    this.Commit(op);
                }
            }

            return true;
        }

        const sl = this.chain.Slice(blks[0].header.prevHash);
        if (sl.length == 0)
        {
            // we are missing some blocks :(
            this.logger.info("we're missing some blocks");
            const missing = await from.Query<Payload>(tHash, blks[0].hash);
            return this.RecvBlocks(missing, from);
        }
        else
        {
            // forked :o
            this.logger.info("we've got a fork");
            await this.HandleFork(blks);
        }
        return false;
    }

    private kv: IKVStore;
    private chain: BlockChain<Payload>;
    private cluster : Cluster<Payload>;
    private pool: PendingPool;
    private config: Config;
    private logger: winston.LoggerInstance;
}