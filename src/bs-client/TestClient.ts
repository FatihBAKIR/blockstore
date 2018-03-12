import { BlockStoreClient } from "./BlockStoreClient";

(async() => {
    const clients = new Array<BlockStoreClient>();
    clients.push(new BlockStoreClient("159.89.50.88", 9090));
    clients.push(new BlockStoreClient("139.59.30.117", 9090));
    clients.push(new BlockStoreClient("188.166.246.211", 9090));
    clients.push(new BlockStoreClient("198.199.108.184", 9090));
    clients.push(new BlockStoreClient("178.62.127.174", 9090));

    const randomClient = () => {
        const rand = Math.floor(Math.random() * 5);
        return clients[rand];
    };

    clients.map(async(cl) => {
        const key = "key" + Math.floor(Math.random() * 100);
        const val = Math.floor(Math.random() * 100);
        console.log(`putting ${key}:${val}`);
        await cl.Put(key, val.toString());
        console.log(`got ${key}:${await randomClient().Get(key)}`);
    });
})();