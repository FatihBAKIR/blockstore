import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');

import {DummyKV} from "./DummyKVStore"
import {IKVStore} from "./IKVStore"

const kv : IKVStore = new DummyKV();

const app = express();
app.disable("etag");
app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
const port = 8080;
const address = "0.0.0.0";
const localhost = "127.0.0.1";
app.listen(port, address);

/**
 * Path: /
 * Type: GET
 * Desc: returns a list of all valid paths
 */
app.get("/", (req, res) => {
    let paths: string[] = [];

    for (let r of app._router.stack) {
      if (r.route && r.route.path) {
        paths.push(r.route.path)
      }
    }

    res.json(paths);
});

/**
 * Path: /op
 * Type: GET
 * Desc: returns a list of all valid operation handling paths
 */
app.get("/op", (req, res) => {
    let paths: string[] = [];
    let expr = /\/op/;

    for (let r of app._router.stack) {
      if (r.route && r.route.path && r.route.path.match(expr)) {
        paths.push(r.route.path)
      }
    }

    res.json(paths);
});

/**
 * Path: /op/get/:key
 * Type: GET
 * Desc: specifies a key to get its corresponding value
 */
app.get("/op/get/:key", async(req, res) => {
    // will read directly from kv store
    const r = kv.Get(req.params.key);
    if (r === undefined)
    {
        res.status(404);
    }
    res.json(r);
});

/**
 * Path: /op/put
 * Type: POST
 * Desc: submits a key-value pair to be created
 */
app.post("/op/put", async(req, res) => {
    res.json(kv.Put(req.body.key, req.body.val));
});

/**
 * Path: /op/update
 * Type: PUT
 * Desc: submits a value to update an exisitng key-value pair
 */
app.put("/op/update/:key", async(req, res) => {
    res.json(kv.Update(req.params.key, req.body.val));
});

/**
 * Path: /op/delete/:key
 * Type: DELETE
 * Desc: specifies a key to delete its entry
 */
app.delete("/op/delete/:key", async(req, res) => {
    res.json(kv.Delete(req.params.key));
});

/**
 * Path: /api
 * Type: GET
 * Desc: returns a list of all valid API paths
 */
app.get("/api", (req, res) => {
    let paths: string[] = [];
    let expr = /\/api/;

    for (let r of app._router.stack) {
      if (r.route && r.route.path && r.route.path.match(expr)) {
        paths.push(r.route.path)
      }
    }

    res.json(paths);
});

console.log(`Blockstore instance running on port ${port} (http://${localhost}:${port})`);
