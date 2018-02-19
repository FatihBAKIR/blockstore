import {Block, MineBlock, ValidateBlock, ValidBlock, Header} from "./Block"
import {Payload, Put} from "./BlockPayload"
import {BlockChain} from "./BlockChain"

(async()=>{
    // Create a new payload with a single put
    const payload = new Payload();
    payload.Add(new Put("hello", "world"));

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
    console.log(JSON.stringify(mined));

    /**
     * This line compiles since we have a validated
     * block now:
     */
    await chain.Append(mined);
    console.log(chain.Tail().nonce);

    /**
     * Validate the original block with the
     * just calculated nonce value
     * Return value is again a validated block   
     */
    const validated : ValidBlock<Payload> = await ValidateBlock(block, mined.nonce);
    console.log(JSON.stringify(validated));

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
        console.log(err);
    }
})();
