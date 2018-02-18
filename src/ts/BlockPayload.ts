type Op = Put | Upd | Del;

export class Put
{
    key: string;
    val: string;
    constructor(key: string, val: string)
    {
        this.key = key;
        this.val = val;
    }
}

export class Upd
{
    key: string;
    val: string;
    constructor(key: string, val: string)
    {
        this.key = key;
        this.val = val;
    }
}

export class Del
{
    key: string;
    constructor(key: string)
    {
        this.key = key;
    }
}

export class Payload
{
    ops: Array<Op>;
    constructor()
    {
        this.ops = [];
    }

    Add(op: Op)
    {
        this.ops.push(op);
    }
}
