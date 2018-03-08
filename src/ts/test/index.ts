import {Block, MineBlock, ValidateBlock, ValidBlock, Header, OriginHash} from "../Block"
import {OpType, Put, Upd, Del, Payload, Operation} from "../Operation"
import {BlockChain} from "../BlockChain"
import {ReplicatedChain} from "../ReplicatedChain"
import {LocalEnd, Replica, Cluster} from "../Cluster"

const cluster = new Cluster<Payload>(parseInt(process.argv[2]));
cluster.AddReplica("localhost", 3000);
cluster.AddReplica("localhost", 3001);
cluster.AddReplica("localhost", 3002);


(async()=>{
    if (process.argv.length < 4) return;
    // Create a new payload with a single put
    const payload = new Payload();
    payload.Add(new Operation(1, 0, new Put("hello", "world"), Date.now()));

    const header = new Header(16, OriginHash, 1);

    // Create a new block from that payload
    const block = new Block<Payload>(header, payload);

    const chain = new ReplicatedChain(cluster, new BlockChain<Payload>());

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
    const h2 = new Header(16, chain.Tail().hash, 2);
    const p2 = new Payload();
    p2.Add(new Operation(1, 1, new Del("hello"), Date.now()));

    const valid2 = await MineBlock(new Block<Payload>(h2, p2));
    console.log("New hash:", valid2.header.prevHash);

    p2.Add(new Operation(1, 2, new Upd("hello", "foo"), Date.now()));

    await chain.Append(valid2);
    console.log("Tail hash:", chain.Tail().hash);
})();
