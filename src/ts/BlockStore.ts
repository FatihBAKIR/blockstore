import { IKVStore } from "./IKVStore";
import { BlockChain } from "./BlockChain";
import { Payload } from "./Operation";
import { DummyKV } from "./DummyKVStore";
import { Config } from "./Config";

class BlockStore implements IKVStore {
    Get(key: string) : string {
        throw new Error("Method not implemented.");
    }
    Put(key: string, val: string) : boolean {
        // create a new block for the operation
        // setup block with operation
        // compute nonce until target is found
        // broadcast to all nodes once found
        // call internal kv function to put value
        throw new Error("Method not implemented.");
    }
    Update(key: string, val: string) {
        throw new Error("Method not implemented.");
    }
    Delete(key: string) : boolean {
        throw new Error("Method not implemented.");
    }

    constructor(config: Config)
    {
        this.kv = new DummyKV;
        this.chain = new BlockChain<Payload>();
    }

    kv: IKVStore;
    chain: BlockChain<Payload>;
}