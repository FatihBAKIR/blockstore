import * as sockio from "socket.io";
import { ValidBlock, Block, ValidateBlock } from "./Block";
import  client = require('socket.io-client');
import {BSON} from "bson";

export class Replica
{
    sock: SocketIOClient.Socket;

    constructor()
    {
        this.sock = client.connect("http://localhost:3000", {reconnection: true});
        const self = this;
        this.sock.on('connect', () => {});
        this.sock.on("ack_block", (hash: string) => {
            self.HandleAck(hash);
        });
    }
    
    Replicate<T>(blk: ValidBlock<T>)
    {
        this.sock.emit('new_block', new BSON().serialize(blk));
    }

    private HandleAck(blkHash: string)
    {
        console.log(`${blkHash} got acked!`);
    }
}

export class LocalEnd<T>
{
    io: SocketIO.Server;
    constructor()
    {
        this.io = sockio.listen(3000);
        const self = this;
        this.io.on('connection', (sock: SocketIO.Socket) => {
            sock.on("new_block", (x: Buffer) => {
                self.HandleBlock(sock, x);
            });
        });
    }

    private async HandleBlock(sock: SocketIO.Socket, x: Buffer)
    {
        console.log(`got block`);
        
        const raw = new BSON().deserialize(x);
        const blk = new Block<T>(raw.payload, raw.header);
        try
        {
            const valid = await ValidateBlock(blk, raw.nonce);
            sock.emit("ack_block", valid.hash);
        }
        catch (err)
        {
            console.log("nope", err);
        }
    }
}

class Cluster
{
    Replicate<T>(blk: ValidBlock<T>)
    {
        for (const r of this.replicas)
        {
            r.Replicate(blk);
        }
    }
    private replicas: Array<Replica> = [];
}