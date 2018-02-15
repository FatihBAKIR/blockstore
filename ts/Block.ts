export class Header
{
	version: number;
	prevHash: Uint8Array;
	merkleRoot: Uint8Array;
	time: number;
	diff: number;
	nonce: number;
}

export class Block<PayloadT>
{
	header:		Header;
	payload: 	PayloadT;
}
