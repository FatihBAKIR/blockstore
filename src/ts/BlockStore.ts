import { IKVStore } from "./IKVStore";

class BlockStore implements IKVStore {
    Get(key: any) {
        throw new Error("Method not implemented.");
    }
    Put(key: any, val: any) {
        // create a new block for the operation
        // setup block with operation
        // compute nonce until target is found
        // broadcast to all nodes once found
        // call internal kv function to put value
        throw new Error("Method not implemented.");
    }
    Update(key: any, val: any) {
        throw new Error("Method not implemented.");
    }
    Delete(key: any) {
        throw new Error("Method not implemented.");
    }
}