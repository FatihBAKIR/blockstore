import md5 = require('md5');
import * as bsnative from "bs-native";

export class Header
{
	readonly version: number;
	readonly prevHash: string;
	readonly merkleRoot: Uint8Array | null;
	readonly time: number;
  readonly diff: number;

  constructor(prev: string, diff: number, version: number = 1, time : number = Date.now())
  {
    this.version = version;
    this.prevHash = prev;
    this.merkleRoot = null;
    this.time = time;
    this.diff = diff;
  }
}

export class Block<PayloadT>
{
  readonly header: Header;
  readonly payload: PayloadT;
  constructor(payload: PayloadT, header: Header)
  {
    this.header = header;
    this.payload = payload;
  }
}

export class ValidBlock<PayloadT> extends Block<PayloadT>
{
  readonly nonce: number;
  readonly hash: string;
  private constructor(blk: Block<PayloadT>, nonce: number, hash: string)
  {
    super(blk.payload, blk.header);
    this.nonce = nonce;
    this.hash = hash;
  }

  static async MineBlock<PayloadT>(blk: Block<PayloadT>) : Promise<ValidBlock<PayloadT>>
  {
    return new Promise<ValidBlock<PayloadT>>((res, rej) => {
      bsnative.MineAsync(GenHeaderHash(blk), blk.header.diff, (nonce, hash) => {
        const result = new ValidBlock<PayloadT>(blk, nonce, hash);
        res(result);
      });
    });
  }
  
  static async Validate<PayloadT>(blk: Block<PayloadT>, nonce: number) : Promise<ValidBlock<PayloadT>>
  {
    return new Promise<ValidBlock<PayloadT>>((res, rej) => {
      bsnative.ValidateAsync(GenHeaderHash(blk), blk.header.diff, nonce, (is_valid, hash) => {
        if (is_valid)
        {
          const result = new ValidBlock<PayloadT>(blk, nonce, hash);
          res(result);
        }
        else
        {
          rej("Bad nonce");
        }
      });
    });
  }
}
 
export function MineBlock<T>(block: Block<T>) : Promise<ValidBlock<T>>
{
  return ValidBlock.MineBlock<T>(block);
}

export function ValidateBlock<T>(block: Block<T>, nonce: number) : Promise<ValidBlock<T>>
{
  return ValidBlock.Validate<T>(block, nonce);
}

export function Hash<T>(block: ValidBlock<T>): Promise<string>
{
  return new Promise<string>((res, rej) => {
    bsnative.HashAsync(GenHeaderHash(block), block.nonce, hash => {
        res(hash);
    });
  });
}

function GenHeaderHash<T>(block : Block<T>) {
  let headerStr = "";

  const b = new Block<T>(block.payload, block.header)
  headerStr = JSON.stringify(b);

  return md5(headerStr);
}