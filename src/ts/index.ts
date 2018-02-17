import bindings = require("bindings");
const native = bindings("addon");
import {Block, GenHeaderHash} from "./Block"


class Get
{
  key: string;
}

class Put
{
    key: string;
    val: string;
}

class Upd
{
    key: string;
    val: string;
}

class Del
{
    key: string;
}

type Op = Get | Put | Upd | Del;

class PlType
{
    ops: Array<Op>;
}

interface IKVStore
{
    Get(key);
    Put(key, val);
    Delete(key);
    Update(key, val);
}

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

const block = new Block<PlType>();

const begin = Date.now();
native.mineAsync(GenHeaderHash(block), 20, (nonce) => {
    const end = Date.now();
    console.log(20, nonce);
    console.log(end - begin);
});


/*let chain : Array<Block<string>>;
let kv : IKVStore;

// wait majority before calling this
function handle_new_block(blk: Block<string>)
{
    chain.push(blk);
}*/