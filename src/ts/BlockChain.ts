import {Block, MineBlock, ValidateBlock, ValidBlock, Hash} from "./Block"

export class BlockChain<T>
{
    async Append(blk: ValidBlock<T>)
    {
        let tail_hash = "00000000000000000000000000000000";
        if (this.blocks.length > 0)
        {
            tail_hash = await Hash(this.Tail());
        }
        if (blk.header.prevHash != tail_hash)
        {
            throw "Previous hash do not match!";
        }
        this.blocks.push(blk);
    }

    Tail() : ValidBlock<T>
    {
        return this.blocks[this.blocks.length - 1];
    }

    constructor()
    {
        this.blocks = [];
    }

    private blocks : Array<ValidBlock<T>>
}