import { BlockStore } from "../BlockStore";
import { Config } from "../Config";

(async() => {
    const cfg = new Config;
    cfg.blkMaxOperationCount = 2;
    const bs = new BlockStore(cfg);
    bs.Put("hello", "world");
    bs.Put("key1", "yo");
    bs.Update("hello", "sgsdf");
    console.log("val:", bs.Get("hello"));
    while (bs.Pending())
    {
        await bs.Flush();
    }
    console.log("val:", bs.Get("hello"));
    console.log("val:", bs.Get("key1"));
})();