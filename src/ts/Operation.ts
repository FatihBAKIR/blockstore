export enum OpType
{
  Get,
  Put,
  Upd,
  Del
}

export class Op
{
    readonly owner: number;
    readonly type: OpType;
    readonly key: string;

    constructor(owner: number, type: OpType, key: string)
    {
        this.owner = owner;
        this.type = type;
        this.key = key;
    }
}

export class Get extends Op
{
    constructor(get: Op)
    {
        super(get.owner, get.type, get.key)
    }
}

export class Put extends Op
{
    readonly valHash: string;

    constructor(put: Op, valHash: string)
    {
        super(put.owner, put.type, put.key)
        this.valHash = valHash;
    }
}

export class Upd extends Op
{
    readonly valHash: string;
    
    constructor(upd: Op, valHash: string)
    {
        super(upd.owner, upd.type, upd.key)
        this.valHash = valHash;
    }
}

export class Del extends Op
{
    constructor(del: Op)
    {
        super(del.owner, del.type, del.key)
    }
}

type PayloadOp = Put | Upd | Del;

export class Payload
{
    ops: Array<PayloadOp>;

    constructor()
    {
        this.ops = [];
    }

    Add(op: PayloadOp)
    {
        this.ops.push(op);
    }
}
