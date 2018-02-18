import md5 = require('md5');
import * as bsnative from "bs-native";

export class Header
{
	version: number;
	prevHash: Uint8Array;
	merkleRoot: Uint8Array;
	time: number;
  diff: number;
  constructor()
  {
    this.version = 1;
    this.prevHash = new Uint8Array(16);
    this.merkleRoot = null;
    this.time = Date.now();
    this.diff = 4;
  }
}

export class Block<PayloadT>
{
	header: Header;
  payload: PayloadT;
  constructor(payload: PayloadT, header: Header = null)
  {
    this.header = header;
    this.payload = payload;
  }
}

export class ValidBlock<PayloadT> extends Block<PayloadT>
{
  nonce: number;
  private constructor(blk: Block<PayloadT>, )
  {
    super(blk.payload, blk.header);
  }

  static async MineBlock<PayloadT>(blk: Block<PayloadT>) : Promise<ValidBlock<PayloadT>>
  {
    return new Promise<ValidBlock<PayloadT>>((res, rej) => {
      bsnative.MineAsync(GenHeaderHash(blk), 16, nonce => {
        const result = new ValidBlock<PayloadT>(blk);
        result.nonce = nonce;
        res(result);
      });
    });
  }
  
  static async Validate<PayloadT>(blk: Block<PayloadT>, nonce: number) : Promise<ValidBlock<PayloadT>>
  {
    return new Promise<ValidBlock<PayloadT>>((res, rej) => {
      bsnative.ValidateAsync(GenHeaderHash(blk), 16, nonce, is_valid => {
        if (is_valid)
        {
          const result = new ValidBlock<PayloadT>(blk);
          result.nonce = nonce;
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

function GenHeaderHash<T>(block : Block<T>) {
  let headerStr = "";

  headerStr = JSON.stringify(block);

  return md5(headerStr);
}