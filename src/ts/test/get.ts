import {Block, MineBlock, ValidateBlock, ValidBlock, Header} from "./Block"
import {OpType, Put, Upd, Del, Payload, Operation} from "./Operation"
import {BlockChain} from "./BlockChain"

(async()=>{
    // Create a new payload with a single put to setup the datastore
    const chain = new BlockChain<Payload>();
    const header = new Header("00000000000000000000000000000000", 16, 100000);
    const payload = new Payload();
    payload.Add(new Operation(1, new Put("hello", "world")));
    const block = new Block<Payload>(payload, header);
    const mined : ValidBlock<Payload> = await MineBlock(block);
    const validated : ValidBlock<Payload> = await ValidateBlock(block, mined.nonce);
    await chain.Append(mined);
})();