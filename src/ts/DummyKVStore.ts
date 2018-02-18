import { IKVStore } from "./IKVStore";

export class DummyKV implements IKVStore
{
    constructor()
    {
        this._kv = {};
    }
    Get(key: string) {
        return this._kv[key];
    }

    Put(key: string, val: string) : boolean {
        if (this.Get(key) !== undefined)
        {
            return false;
        }

        this._kv[key] = val;

        return true;
    }

    Delete(key: string) : boolean {
        delete this._kv[key];
        return true;
    }

    Update(key: string, val: string) {
        this._kv[key] = val;
    }

    private _kv : {};
}