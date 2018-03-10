import * as sockio from "socket.io";
import { ValidBlock, Block, ValidateBlock } from "./Block";
import  client = require('socket.io-client');
import { BSON } from "bson";
import { setTimeout, clearTimeout } from "timers";

export class Replica
{
    sock: SocketIOClient.Socket;
    connected: boolean;
    host: string;
    port: number;

    constructor(host: string, port: number, ownPort: number)
    {
        this.host = host;
        this.port = port;
        this.connected = false;
        this.sock = client.connect(`http://${host}:${port}`, {reconnection: true});
        const self = this;
        this.sock.on('connect', () => {
            self.connected = true;
            this.sock.emit('handshake', ownPort);
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
                return;
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

    Query<T>(begin: string, end: string, timeout: number = 5000) : Promise<ValidBlock<T>[]>
    {
        return new Promise<ValidBlock<T>[]>((res, rej)=>{
            const req_id = Math.floor(Math.random() * 10000);
            if (!this.connected)
            {
                rej("not connected");
                return;
            }
            this.sock.emit('query', req_id, begin, end);
            const to = setTimeout(() => {
                this.sock.off(`reply_${req_id}`);
                rej("timeout");
            }, timeout);
            this.sock.on(`reply_${req_id}`, async(reply: Buffer) => {
                this.sock.off(`reply_${req_id}`);
                clearTimeout(to);

                const result = new Array<ValidBlock<T>>();
                const raw = new BSON().deserialize(reply);
                
                for (const key in raw)
                {
                    const rawblk = raw[key];
                    const blk = new Block<T>(rawblk.header, rawblk.payload);
                    try
                    {
                        const valid = await ValidateBlock(blk, rawblk.nonce);
                        result.push(valid);
                    }
                    catch (err)
                    {
                        console.log("nope", err);
                    }
                }
                res(result);
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
            sock.on("handshake", (port: number) => {
                const sp = sock.handshake.address.split(':');
                cluster.GotConnection(sp[sp.length - 1], port, sock);
            });
            sock.on("new_block", (x: Buffer) => {
                self.HandleBlock(sock, x);
            });

            sock.on("query", (req_id: number, begin: string, end: string) => {
                self.HandleQuery(sock, req_id, begin, end);
            });
        });
    }

    private async HandleBlock(sock: SocketIO.Socket, x: Buffer)
    {        
        const raw = new BSON().deserialize(x);
        const blk = new Block<T>(raw.header, raw.payload);
        try
        {
            const valid = await ValidateBlock(blk, raw.nonce);
            await this.cluster.Received(valid, sock);
            sock.emit(`ack_${valid.hash}`);
            sock.emit("ack_block", valid.hash);
        }
        catch (err)
        {
            console.log("nope", err);
        }
    }

    private async HandleQuery(sock: SocketIO.Socket, req_id: number, begin: string, end: string)
    {
        const res = await this.cluster.DoQuery(begin, end);
        sock.emit(`reply_${req_id}`, new BSON().serialize(res));
    }
}

type HandlerT<T> = (x: ValidBlock<T>[], from: Replica) => Promise<boolean>;
type QueryHandler<T> = (begin: string, end: string) => Promise<ValidBlock<T>[]>;

export class Cluster<T>
{
    constructor(port: number, queryHandler: QueryHandler<T>)
    {
        this.pending = {};
        this.local = new LocalEnd<T>(this, port);
        this.handler = new Array<HandlerT<T>>();
        this.localPort = port;
        this.connMapping = {};
        this.qHandler = queryHandler;
    }

    Replicate(blk: ValidBlock<T>) : Promise<void>
    {
        const self = this;
        return new Promise<void>((res, rej) => {
            /*if (!self.pending[blk.hash])
            {
                self.pending[blk.hash] = { blk: blk, count: 0, commit: false };
            }*/
    
            let accept = 0;
            let done = 0;

            for (const r of self.replicas)
            {
                r.Replicate(blk).then(() => {
                    accept += 1;
                    done += 1;
                    if (accept + 1 > self.replicas.length / 2)
                    {
                        res();
                    }
                }).catch(err => {
                    console.log(`err: ${err}`);
                    done += 1;
                    if (done == self.replicas.length)
                    {
                        rej("majority rejected");
                    }
                });
            }
            /*if (self.replicas.length == 0)
            {*/
                res();
            //}
        });
    }

    /**
     * Queries the cluster for subchains that come after the given hash
     * @param after blocks to query after the given hash
     */
    async Query(begin: string, end: string)
    {

    }

    async Received(blk: ValidBlock<T>, from: SocketIO.Socket)
    {
        /*if (!this.pending[blk.hash])
        {
            await this.Replicate(blk);
        }*/

        const repl = this.MapConnection(from);
        console.log(`got from ${repl.host}:${repl.port}`)
        const res = await this.handler[0]([blk], repl);
        
        /*this.pending[blk.hash].count++;
        if (!this.pending[blk.hash].commit && 
            this.pending[blk.hash].count > Math.floor(this.replicas.length / 2))
        {
            console.log(`Commit ${blk.hash}`);
            console.log(this.pending[blk.hash]);
            this.pending[blk.hash].commit = true;
        }*/
    }

    AddReplica(host: string, port: number)
    {
        for (const repl of this.replicas)
        {
            if (repl.host == host && repl.port == port)
            {
                return repl;
            }
        }

        const repl = new Replica(host, port, this.localPort);
        this.replicas.push(repl);
        return repl;
    }

    private MapConnection(sock: SocketIO.Socket) : Replica
    {
        return this.connMapping[sock.id];
    }

    GotConnection(host: string, port: number, sock: SocketIO.Socket)
    {
        for (const repl of this.replicas)
        {
            if (repl.host == host && repl.port == port)
            {
                this.connMapping[sock.id] = repl;
                break;
            }
        }

        const repl = this.AddReplica(host, port);
        this.connMapping[sock.id] = repl;        
    }

    Local() : LocalEnd<T>
    {
        return this.local;
    }

    AttachBlockHandler(foo: HandlerT<T>)
    {
        this.handler.push(foo);
    }

    DoQuery(begin: string, end: string)
    {
        return this.qHandler(begin, end);
    }

    private local: LocalEnd<T>;
    private replicas: Array<Replica> = [];
    private pending: { [hash: string] : { blk: ValidBlock<T>, count: number, commit: boolean } };
    private handler: Array<HandlerT<T>>;
    private qHandler: QueryHandler<T>;
    private localPort: number;
    private connMapping : { [ep: string] : Replica };
}