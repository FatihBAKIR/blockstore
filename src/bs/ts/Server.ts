import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');
import { Config } from './Config';
import { BlockStore } from './BlockStore';

const port : number = parseInt(process.argv[2]) || 8080;
const address : string = '127.0.0.1';
const config : Config = Config.LoadConfig('./config.yaml');
const bs : BlockStore = new BlockStore(config, port);

/*
 * App Configuration
 */
const app = express();
app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.bs = bs;
    next();
});

/*
 * Controllers
 */
import requests = require('./controllers/Requests');
import api = require('./controllers/API');

/*
 * Routes
 */
app.use('/req', requests);
app.use('/api', api);

/*
 * Path: /
 * Type: GET
 * Desc: returns a list of all valid routes
 */
app.get('/', (req, res) => {
    let paths: string[] = [];

    for (let r of req.app._router.stack) {
      if (r.route && r.route.path) {
        paths.push(r.route.path)
      }
    }

    res.json(paths);
});

app.listen(port, address);
console.log(`Blockstore Server instance running on port ${port} (http://${address}:${port})`);
