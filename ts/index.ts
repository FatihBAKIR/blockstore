import bindings = require("bindings");
const mod = bindings("addon");

import {Block} from "./Block"

const b = new Block<string>();

mod.mineAsync("yolo", 10, (res, x) => {
    console.log(res, x);
});
