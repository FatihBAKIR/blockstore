import md5 = require('md5');

export class Header
{
	version: number;
	prevHash: Uint8Array;
	merkleRoot: Uint8Array;
	time: number;
	diff: number;
}

export class Block<PayloadT>
{
  nonce: number;
	header:		Header;
	payload: 	PayloadT;
}

export function GenHeaderHash<T>(block : Block<T>) {
  const hash = "";
  
  for(let property in block) {
    if(block.hasOwnProperty(property)) {
      hash.concat(block.property.toString());
    }
  }

  return hash;
}