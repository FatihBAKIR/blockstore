import md5 = require('md5');
import * as bsnative from "bs-native";
import { BSON } from "bson";

export class Header
{
  readonly diff: number;
  readonly prevHash: string;
	readonly version: number;
	readonly time: number;

  constructor(diff: number, prevHash: string = "00000000000000000000000000000000", version: number = 1, time: number = Date.now())
  {
    this.diff = diff;
    this.prevHash = prevHash;
    this.version = version;
    this.time = time;
  }
}

export class Block<PayloadT>
{
  readonly header: Header;
  readonly payload: Readonly<PayloadT>;

  constructor(header: Header, payload: PayloadT)
  {
    this.header = header; // no need to deep copy, it's read only
    this.payload = JSON.parse(JSON.stringify(payload)); // deep copy hack
  }
}

export class ValidBlock<PayloadT> extends Block<PayloadT>
{
  readonly nonce: number;
  readonly hash: string;

  private constructor(blk: Block<PayloadT>, nonce: number, hash: string)
  {
    super(blk.header, blk.payload);
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

function Hash<T>(block: ValidBlock<T>): Promise<string>
{
  return new Promise<string>((res, rej) => {
    bsnative.HashAsync(GenHeaderHash(block), block.nonce, hash => {
        res(hash);
    });
  });
}

function GenHeaderHash<T>(block : Block<T>) {
  const bson = new BSON;
  const s = bson.serialize(new Block<T>(block.header, block.payload));
  return md5(s);
}