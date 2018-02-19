import {Block, MineBlock, ValidateBlock, ValidBlock, Header} from "./Block"
import {OpType, Op, Put, Upd, Del, Payload} from "./Operation"
import {BlockChain} from "./BlockChain"

(async()=>{
    // Create a new payload with a single put
    const payload = new Payload();
    payload.Add(new Put(new Op(1, OpType.Put, "hello"), "world"));

    const header = new Header("00000000000000000000000000000000", 16);

    // Create a new block from that payload
    const block = new Block<Payload>(payload, header);

    const chain = new BlockChain<Payload>();

    /**
     * The below line doesn't compile because
     * the block hasn't been mined yet
     */
    // chain.Append(block);
    
    /**
     * Mine the block
     * 
     * Note that this has the type ValidBlock<Payload> instead
     * of regular BlocK<Payload>
     */
    const mined : ValidBlock<Payload> = await MineBlock(block);
    
    /**
     * Validate the original block with the
     * just calculated nonce value
     * Return value is again a validated block   
     */
    const validated : ValidBlock<Payload> = await ValidateBlock(block, mined.nonce);

    /**
     * This line compiles since we have a validated
     * block now:
     */
    await chain.Append(mined);
    console.log("Tail hash:", chain.Tail().hash);

    try
    {
        await chain.Append(mined);
    }
    catch(err)
    {
        console.log("Error:", err);
    }

    /**
     * Push another block that deletes the previous one
     */
    const h2 = new Header(chain.Tail().hash, 16);
    const p2 = new Payload();
    p2.Add(new Del(new Op(1, OpType.Del, "hello")));

    const valid2 = await MineBlock(new Block<Payload>(p2, h2));
    console.log("New hash:", valid2.header.prevHash);

    p2.Add(new Upd(new Op(1, OpType.Upd, "hello"), "foo"));

    await chain.Append(valid2);
    console.log("Tail hash:", chain.Tail().hash);

    /**
     * In the case where we pass a wrong nonce to
     * the validate function, it'll throw an
     * exception
     */
    try
    {
        const validated = await ValidateBlock(block, mined.nonce + 1);
        console.log(JSON.stringify(validated));
    }
    catch(err)
    {
        console.log("Error:", err);
    }
})();
