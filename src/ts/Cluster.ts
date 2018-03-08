import * as sockio from "socket.io";
import { ValidBlock, Block, ValidateBlock } from "./Block";
import  client = require('socket.io-client');
import { BSON } from "bson";
import { setTimeout, clearTimeout } from "timers";

export class Replica
{
    sock: SocketIOClient.Socket;
    connected: boolean;

    constructor(host: string, port: number)
    {
        this.connected = false;
        this.sock = client.connect(`http://${host}:${port}`, {reconnection: true});
        const self = this;
        this.sock.on('connect', () => {
            self.connected = true;
        });
        this.sock.on("ack_block", (hash: string) => {
            self.HandleAck(hash);
        });
    }
    
    Replicate<T>(blk: ValidBlock<T>, timeout: number = 5000) : Promise<void>
    {
        return new Promise<void>((res, rej)=>{
            if (!this.connected)
            {
                rej("not connected");
            }
            this.sock.emit('new_block', new BSON().serialize(blk));
            const to = setTimeout(() => {
                this.sock.off(`ack_${blk.hash}`);
                rej("timeout");
            }, timeout);
            this.sock.on(`ack_${blk.hash}`, () => {
                this.sock.off(`ack_${blk.hash}`);
                clearTimeout(to);
                res();
            });
        });
    }

    private HandleAck(blkHash: string)
    {
        //console.log(`${blkHash} got acked!`);
    }
}

export class LocalEnd<T>
{
    cluster: Cluster<T>;
    io: SocketIO.Server;
    constructor(cluster: Cluster<T>, port: number)
    {
        this.cluster = cluster;
        this.io = sockio.listen(port);
        const self = this;
        this.io.on('connection', (sock: SocketIO.Socket) => {
            sock.on("new_block", (x: Buffer) => {
                self.HandleBlock(sock, x);
            });
        });
    }

    private async HandleBlock(sock: SocketIO.Socket, x: Buffer)
    {        
        const raw = new BSON().deserialize(x);
        const blk = new Block<T>(raw.payload, raw.header);
        try
        {
            const valid = await ValidateBlock(blk, raw.nonce);
            await this.cluster.Received(valid);
            sock.emit(`ack_${valid.hash}`);
            sock.emit("ack_block", valid.hash);
        }
        catch (err)
        {
            console.log("nope", err);
        }
    }
}

export class Cluster<T>
{
    constructor(port: number)
    {
        this.pending = {};
        console.log(port);
        this.local = new LocalEnd<T>(this, port);
    }

    Replicate(blk: ValidBlock<T>) : Promise<void>
    {
        return new Promise<void>((res, rej) => {
            if (!this.pending[blk.hash])
            {
                this.pending[blk.hash] = { blk: blk, count: 0, commit: false };
            }
    
            let accept = 0;
            let done = 0;

            const self = this;
            for (const r of this.replicas)
            {
                r.Replicate(blk).then(() => {
                    accept += 1;
                    done += 1;
                    if (accept + 1 > self.replicas.length / 2)
                    {
                        res();
                    }
                }).catch(err => {
                    done += 1;
                    if (done == self.replicas.length)
                    {
                        rej("majority rejected");
                    }
                });
            }
        });
    }

    async Received(blk: ValidBlock<T>)
    {
        if (!this.pending[blk.hash])
        {
            await this.Replicate(blk);
        }
        
        this.pending[blk.hash].count++;
        if (!this.pending[blk.hash].commit && 
            this.pending[blk.hash].count > Math.floor(this.replicas.length / 2))
        {
            console.log(`Commit ${blk.hash}`);
            console.log(this.pending[blk.hash]);
            this.pending[blk.hash].commit = true;
        }
    }

    AddReplica(host: string, port: number)
    {
        this.replicas.push(new Replica(host, port));
    }

    Local() : LocalEnd<T>
    {
        return this.local;
    }

    private local: LocalEnd<T>;
    private replicas: Array<Replica> = [];
    private pending: { [hash: string] : { blk: ValidBlock<T>, count: number, commit: boolean } };
}