import {Block, MineBlock, ValidateBlock, ValidBlock} from "./Block"
import {Payload, Put} from "./BlockPayload"

(async()=>{
    // Create a new payload with a single put
    const payload = new Payload();
    payload.Add(new Put("hello", "world"));

    // Create a new block from that payload
    const block = new Block<Payload>(payload);
    
    /**
     * Mine the block
     * 
     * Note that this has the type ValidBlock<Payload> instead
     * of regular BlocK<Payload>
     */
    const mined : ValidBlock<Payload> = await MineBlock(block);
    console.log(JSON.stringify(mined));

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
