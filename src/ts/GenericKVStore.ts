import { IKVStore } from "./IKVStore";

export class GenericKVStore implements IKVStore
{
    constructor()
    {
        this._kv = {};
    }
    
    // READ a Value given its Key
    Get(key: string) : string 
    {
        return this._kv[key];
    }

    // CREATE a Key-Value pair
    Put(key: string, val: string) : boolean 
    {
        if (this.Get(key) !== undefined)
        {
            return false;
        }

        this._kv[key] = val;

        return true;
    }

    // UPDATE a Value given its Key
    Update(key: string, val: string) : boolean 
    {
        if (this.Get(key) === undefined)
        {
            return false;
        }

        this._kv[key] = val;

        return true;
    }

    // REMOVE a Key and its associated Value
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