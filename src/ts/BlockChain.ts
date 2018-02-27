import {Block, MineBlock, ValidateBlock, ValidBlock} from "./Block"

export class BlockChain<T>
{
    /**
     * Appends the given block to the blockchain.
     * 
     * @param blk   A valid block. This block should have 
     *              its previous hash equal to either all zeros or
     *              to the hash of the tail of this blockchain
     */
    async Append(blk: ValidBlock<T>)
    {
        // previous hash of the genesis block should be all zero
        let tail_hash = "00000000000000000000000000000000";
        if (this.blocks.length > 0)
        {
            tail_hash = this.Tail().hash;
        }
        if (blk.header.prevHash != tail_hash)
        {
            throw "Previous hash do not match!";
        }
        this.blocks.push(blk);
    }

    /**
     * Returns the tail of the blockchain
     */
    Tail() : ValidBlock<T>
    {
        return this.blocks[this.blocks.length - 1];
    }

    constructor()
    {
        this.blocks = [];
    }

    private blocks : Array<ValidBlock<T>>;
}