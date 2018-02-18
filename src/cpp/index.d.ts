declare module "bs-native"
{
    function MineAsync(preHash: string, difficulty: number, cb: (nonce: number) => void);
    function ValidateAsync(preHash: string, difficulty: number, nonce: number, cb: (valid: boolean) => void);

    export { MineAsync, ValidateAsync };
}