import bindings = require("bindings");
const mod = bindings("addon");

import {Block} from "./Block"

const b = new Block<string>();

mod.mineAsync("yolo", 40, (res, x) => {
    console.log(res, x);
});

mod.mineAsync("holo", 40, (res, x) => {
    console.log(res, x);
});