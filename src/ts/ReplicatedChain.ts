import {BlockChain} from "./BlockChain"
import { ValidBlock } from "./Block";
import {Cluster} from "./Cluster";

export class ReplicatedChain<T>
{
    constructor(clust: Cluster<T>, chain: BlockChain<T>)
    {
        this.cluster = clust;
        this.chain = chain;
    }

    async Append(block: ValidBlock<T>)
    {
        await this.cluster.Replicate(block);
        await this.chain.Append(block);
    }

    Tail()
    {
        return this.chain.Tail();
    }

    private cluster: Cluster<T>;
    private chain: BlockChain<T>;
}