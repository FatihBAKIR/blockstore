import { Block, MineBlock, ValidateBlock, ValidBlock, OriginHash } from "./Block"

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
        let tail_hash = OriginHash;
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

    PopBack() : ValidBlock<T>
    {
        return <ValidBlock<T>>this.blocks.pop();
    }

    constructor()
    {
        this.blocks = [];
    }

    Slice(fromHash: string) : Array<ValidBlock<T>>
    {
        if (fromHash == OriginHash)
        {
            return this.blocks.slice(0);
        }

        const res = new Array<ValidBlock<T>>();

        let i = 0;
        for (; i < this.blocks.length; ++i)
        {
            if (this.blocks[i].hash == fromHash) break;
        }
        
        return this.blocks.slice(i);
    }

    async Clone()
    {
        const other = new BlockChain<T>();
        for (const block of this.blocks)
        {
            other.blocks.push(block);
        }
        return other;
    }

    private blocks : Array<ValidBlock<T>>;
}