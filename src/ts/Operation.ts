export enum OpType
{
  Put,
  Upd,
  Del
}

abstract class Op
{
    readonly type: OpType;

    constructor(type: OpType)
    {
        this.type = type;
    }
}

abstract class KeyedOp extends Op
{
    readonly key: string;

    constructor(type: OpType, key: string)
    {
        super(type);
        this.key = key;
    }    
}

export class Put extends KeyedOp
{
    readonly val: string;

    constructor(key: string, val: string)
    {
        super(OpType.Put, key)
        this.val = val;
    }
}

export class Upd extends KeyedOp
{
    readonly val: string;
    
    constructor(key: string, val: string)
    {
        super(OpType.Upd, key);
        this.val = val;
    }
}

export class Del extends KeyedOp
{
    constructor(key: string)
    {
        super(OpType.Del, key);
    }
}

export type Operations = Put | Upd | Del;
export class Operation
{
    readonly owner: number;
    readonly op: Operations;

    constructor(owner: number, op: Operations)
    {
        this.owner = owner;
        this.op = op;
    }
}

export class Payload
{
    ops: Array<Operation>;

    constructor()
    {
        this.ops = [];
    }

    Add(op: Operation)
    {
        this.ops.push(op);
    }
}
