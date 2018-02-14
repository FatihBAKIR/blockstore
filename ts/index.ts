import bindings = require("bindings");
const mod = bindings("addon");

console.log(mod.calculateAsync(500000000, (res) => {
    console.log(res);
}));