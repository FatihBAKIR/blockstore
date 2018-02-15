import bindings = require("bindings");
const mod = bindings("addon");

import {Block} from "./Block"

class Put
{
    key: string;
    val: string;
}

class Del
{
    key: string;
}

class Upd
{
    key: string;
    val: string;
}

type Op = Put | Del | Upd;

class PlType
{
    ops: Array<Op>;
}

const b = new Block<PlType>();

class BlockStore implements IKVStore {
    put(key: any, val: any) {
        throw new Error("Method not implemented.");
    }
    get(key: any) {
        throw new Error("Method not implemented.");
    }
    delete(key: any) {
        throw new Error("Method not implemented.");
    }
    update(key: any, val: any) {
        throw new Error("Method not implemented.");
    }
}

mod.mineAsync("yolo", 43, false, (res, x) => {
    console.log(res, x);
});

mod.mineAsync("holo", 43, true, (res, x) => {
    console.log(res, x);
});

interface IKVStore
{
    put(key, val);
    get(key);
    delete(key);
    update(key, val);
}

let chain : Array<Block<string>>;
let kv : IKVStore;

// blk -> put("yo", 123);

// wait majority before calling this
function handle_new_block(blk: Block<string>)
{
    chain.push(blk);
}