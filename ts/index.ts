import bindings = require("bindings");
const mod = bindings("addon");

import {Block} from "./Block"

const b = new Block<string>();

mod.mineAsync("yolo", 43, (res, x) => {
    console.log(res, x);
});

mod.mineAsync("holo", 43, (res, x) => {
    console.log(res, x);
});