declare module "bs-native"
{
    function MineAsync(preHash: string, difficulty: number, cb: (nonce: number, hash: string) => void);
    function ValidateAsync(preHash: string, difficulty: number, nonce: number, cb: (valid: boolean, hash: string) => void);
    function HashAsync(preHash: string, nonce: number, cb: (hash: string) => void);

    export { MineAsync, ValidateAsync, HashAsync };
}