export class Put
{
    readonly kind = "put";
    readonly key: string;
    readonly val: string;
    constructor(key: string, val: string)
    {
        this.key = key;
        this.val = val;
    }
}

export class Upd
{
    readonly kind = "upd";
    readonly key: string;
    readonly val: string;
    constructor(key: string, val: string)
    {
        this.key = key;
        this.val = val;
    }
}

export class Del
{
    readonly kind = "del";
    readonly key: string;
    constructor(key: string)
    {
        this.key = key;
    }
}

type Op = Put | Upd | Del;

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
