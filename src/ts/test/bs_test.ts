import { BlockStore } from "../BlockStore";
import { Config } from "../Config";

function delay(t: number) : Promise<void> {
    return new Promise<void>((resolve, rej) => { 
        setTimeout(() => {
            resolve();
        }, t)
    });
 }

(async() => {
    const cfg = new Config;
    cfg.blkMaxOperationCount = 2;
    const bs = new BlockStore(cfg, parseInt(process.argv[2]));
    await delay(1000);
    if (parseInt(process.argv[2]) == 3000)
    {
        bs.Put("hello", "world", 1000);
        bs.Put("key1", "yo", 1001);
        bs.Update("hello", "sgsdf", 1002);
        console.log("val:", bs.Get("hello"));
        while (bs.Pending())
        {
            await bs.Flush();
        }
    }
    else 
    {
        for (let i = 0; i < 5; ++i)
        {
            console.log(`${5 - i}...`);            
            await delay(1000);
        }
    }
    console.log("val:", bs.Get("hello"));
    console.log("val:", bs.Get("key1"));
})();