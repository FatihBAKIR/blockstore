import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');

import { Config } from "./Config";
import { BlockStore } from "./BlockStore";

const bs : BlockStore = new BlockStore(Config.LoadConfig("./config.yaml"), parseInt(process.argv[2]));

const app = express();

app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = parseInt(process.argv[2]) - 3000 + 8000;
const localhost = '127.0.0.1';

import routes = require('./BlockstoreRoutes');

app.use((req, res, next) => {
    req.bs = bs;
    next();
});

/*
 * Path: /
 * Type: GET
 * Desc: returns a list of all valid paths
 */
app.get("/", (req, res) => {
    let paths: string[] = [];

    for (let r of req.app._router.stack) {
      if (r.route && r.route.path) {
        paths.push(r.route.path)
      }
    }

    res.json(paths);
});

app.use('/req', routes);
//app.get('/api', routes.api);

app.listen(port, localhost);
console.log(`Blockstore Server instance running on port ${port} (http://${localhost}:${port})`);
