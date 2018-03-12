export declare class BlockStoreClient {
    constructor(host: string, port: number);
    Get(key: string): Promise<string>;
    Put(key: string, val: string): Promise<void>;
    Update(key: string, val: string): Promise<void>;
    Delete(key: string): Promise<void>;
    private host;
    private port;
    private getUrl();
}
