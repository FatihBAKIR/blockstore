import { IKVStore } from "./IKVStore";

export class GenericKVStore implements IKVStore
{
    constructor()
    {
        this._kv = {};
    }
    
    Get(key: string) : string 
    {
        return this._kv[key];
    }

    Put(key: string, val: string) : boolean 
    {
        if (this.Get(key) !== undefined)
        {
            return false;
        }

        this._kv[key] = val;

        return true;
    }

    Update(key: string, val: string) : boolean 
    {
        if (this.Get(key) === undefined)
        {
            return false;
        }

        this._kv[key] = val;

        return true;
    }

    Delete(key: string) : boolean 
    {
        if (this.Get(key) === undefined)
        {
            return false;
        }

        delete this._kv[key];
        
        return true;
    }

    private _kv : { [key: string]: string };
}