export interface IKVStore
{
    Get(key);
    Put(key, val);
    Delete(key);
    Update(key, val);
}
