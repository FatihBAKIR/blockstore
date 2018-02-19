export interface IKVStore
{
    Get(key: string) : string;
    Put(key: string, val: string) : boolean;
    Update(key: string, val: string) : boolean;
    Delete(key: string) : boolean;
}
