import { Config } from "./Config";
import { IKVStore } from "./IKVStore";
import { GenericKVStore } from "./GenericKVStore";
import { Payload, Operation, Put, Upd, Del, OpType } from "./Operation";
import { Block, MineBlock, ValidateBlock, ValidBlock, Header, OriginHash } from "./Block"
import { BlockChain } from "./BlockChain";
import { Cluster } from "./Cluster";
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
            if(kv.Put(oper.key, oper.val)) {
              this.logger.info(`Commit Valid: ${JSON.stringify(op.op)}`);
            }
            else {
              this.logger.info(`Commit Invalid: ${JSON.stringify(op.op)}`);
            }
        }
        break;
        case OpType.Upd:
        {
            const oper = <Upd>op.op;
            if(kv.Update(oper.key, oper.val)) {
              this.logger.info(`Commit Valid: ${JSON.stringify(op.op)}`);
            }
            else {
              this.logger.info(`Commit Invalid: ${JSON.stringify(op.op)}`);
            }
        }
        break;
        case OpType.Del:
        {
            const oper = <Del>op.op;
            if(kv.Delete(oper.key)) {
              this.logger.info(`Commit Valid: ${JSON.stringify(op.op)}`);
            }
            else {
              this.logger.info(`Commit Invalid: ${JSON.stringify(op.op)}`);
            }
        }
        break;
    }
}

export class BlockStore implements IKVStore {
    private next_id = 1;
    Get(key: string) : string {
        return this.kv.Get(key);
    }

    Put(key: string, val: string) : boolean 
    {
        this.pool.PushBack(new Operation(1, this.next_id++, new Put(key, val)));
        return true;
    }

    Update(key: string, val: string) : boolean {
        this.pool.PushBack(new Operation(1, this.next_id++, new Upd(key, val)));
        return true;
    }

    Delete(key: string) : boolean {
        this.pool.PushBack(new Operation(1, this.next_id++, new Del(key)));
        return true;
    }

    constructor(config: Config)
    {
        this.config = config;
        this.kv = new GenericKVStore;
        this.chain = new BlockChain<Payload>();
        this.cluster = new Cluster(3000);
        this.pool = new PendingPool;
        this.config = config;
        this.logger = new winston.Logger({
            transports: [
                new winston.transports.Console
            ]
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
    private async HandleFork(fork: [ValidBlock<Payload>])
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

            const diff = Difference(fork, tail); // ops in fork but not in tail
            for (const op of diff)
            {
                this.pool.PushBack(op);
            }
            
            return;
        }

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

    private async RecvBlocks(blks: [ValidBlock<Payload>]) : Promise<boolean>
    {
        return false;
    }

    private kv: IKVStore;
    private chain: BlockChain<Payload>;
    private cluster : Cluster<Payload>;
    private pool: PendingPool;
    private config: Config;
    private logger: winston.LoggerInstance;
}