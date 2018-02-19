declare module "bs-native"
{
    function MineAsync(preHash: string, difficulty: number, cb: (nonce: number) => void);
    function ValidateAsync(preHash: string, difficulty: number, nonce: number, cb: (valid: boolean) => void);
    function HashAsync(preHash: string, nonce: number, cb: (hash: string) => void);

    export { MineAsync, ValidateAsync, HashAsync };
}