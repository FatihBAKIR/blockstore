import request = require("request");

export class BlockStoreClient
{
    constructor(host: string, port: number)
    {
        this.host = host;
        this.port = port;
    }

    Get(key: string)
    {
        return new Promise<string>((resolve, rej) => {
            const time = Date.now();
            request.get(`${this.getUrl()}/req/get/${key}`, async (err, res, body) => {
                if (err)
                {
                    rej();
                }
                else
                {
                    resolve(body);
                }
            });
        });
    }

    Put(key: string, val: string)
    {
        return new Promise<void>((resolve, rej) => {
            const time = Date.now();
            request.post(`${this.getUrl()}/req/put`, {
                form:{
                    key,
                    val,
                    time
                }
            }, async (err, res, body) => {
                if (err)
                {
                    rej();
                }
                else
                {
                    resolve();
                }
            });
        });
    }

    Update(key: string, val: string)
    {
        return new Promise<void>((resolve, rej) => {
            const time = Date.now();
            request.put(`${this.getUrl()}/req/upd/${key}`, {
                form:{
                    val,
                    time
                }
            }, async (err, res, body) => {
                if (err)
                {
                    rej();
                }
                else
                {
                    resolve();
                }
            });
        });
    }

    Delete(key: string)
    {
        return new Promise<void>((resolve, rej) => {
            const time = Date.now();
            request.delete(`${this.getUrl()}/req/del/${key}`, {
                form:{
                    time
                }
            }, async (err, res, body) => {
                if (err)
                {
                    rej();
                }
                else
                {
                    resolve();
                }
            });
        });
    }

    private host: string;
    private port: number;
    private getUrl()
    {
        return `http://${this.host}:${this.port}`;
    }
}