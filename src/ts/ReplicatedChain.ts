import {BlockChain} from "./BlockChain"
import { ValidBlock } from "./Block";

class ReplicatedChain<T>
{
    async Append(block: ValidBlock<T>)
    {

    }

    private chain: BlockChain<T>;
}