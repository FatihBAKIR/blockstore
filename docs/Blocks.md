# Blocks

Each block in BlockStore represents some number of operations on the underlying key-value store.

Blocks are implemented as 2 different types in BlockStore:

1. `Block<T>`
2. `ValidBlock<T>`

## BlocK<T>

Objects of type `Block<T>` store the header information and the payload of type T of a block. However
`Block<T>` objects do not have a `nonce` field. This is because such objects are not eligible to be 
placed in the block chain yet. They have to be mined or validated with a nonce value first.

These operations are supported throught the following functions in _Block.ts_:

1. `MineBlock<T>(blk: Block<T>) : Promise<ValidBlock<T>>`
2. `ValidateBlocK<T>(blk: Block<T>, nonce: number) : Promise<ValidBlocK<T>>`

These functions try to calculate the nonce or use the given one to create an object of `ValidBlock<T>`.

## ValidBlock<T>

Unlike regular `Block<T>` objects, objects of `ValidBlock<T>` have a `nonce` field and by definition
of `ValidBlock<T>`, that nonce is the correct nonce. It is impossible to construct an object of
`ValidBlock<T>` without either verifying a nonce or mining the nonce from the ground.

The implication of this is basically we never need to worry about a block being invalid in the
implementation of the block chain or the store. The `BlockChain` class doesn't have a function to append 
`Block<T>`s into it, it only has an append function for `ValidBlock<T>`s. The compiler will prevent 
such malformed appends and potential horrible bugs.