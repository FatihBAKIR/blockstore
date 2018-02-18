import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');

import {DummyKV} from "./DummyKVStore"
import {IKVStore} from "./IKVStore"

const app = express();
app.disable("etag");
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const kv : IKVStore = new DummyKV();

const port = 8080;
app.listen(port, "0.0.0.0");

app.get("/", (req, res) => {
    res.json("yo");
});

app.post("/api/put", async(req, res) => {

    res.json(kv.Put(req.body.key, req.body.val));
});

app.delete("/api/delete/:key", async(req, res) => {
    res.json(kv.Delete(req.params.key));
});

app.get("/api/get/:key", async(req, res) => {
    // will read directly from kv store
    const r = kv.Get(req.params.key);
    if (r === undefined)
    {
        res.status(404);
    }
    res.json(r);
});



app.post("/bs/append", async(req, res) => {
    /**
     * this endpoint is used by other BS instances that
     * mined a block and want to let us know of that
     * we'll still validate the block though
     * we'll also validate the other endpoint
     */
});

console.log(`running on ${port}`);
