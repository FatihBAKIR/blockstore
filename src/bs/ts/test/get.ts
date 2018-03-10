import {Block, MineBlock, ValidateBlock, ValidBlock, Header, OriginHash} from "../Block"
import {OpType, Put, Upd, Del, Payload, Operation} from "../Operation"
import {BlockChain} from "../BlockChain"

(async()=>{
    // Create a new payload with a single put to setup the datastore
    const chain = new BlockChain<Payload>();
    const header = new Header(16, OriginHash, 1);
    const payload = new Payload();
    payload.Add(new Operation(1, 0, new Put("hello", "world"), Date.now()));
    const block = new Block<Payload>(header, payload);
    const mined : ValidBlock<Payload> = await MineBlock(block);
    const validated : ValidBlock<Payload> = await ValidateBlock(block, mined.nonce);
    await chain.Append(mined);
})();
