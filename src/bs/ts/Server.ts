import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');
import { Config } from './Config';
import { BlockStore } from './BlockStore';

const address : string = '0.0.0.0';
const config : Config = Config.LoadConfig('./config.yaml');
const internalPort : number = config.nwInternalPort || 8080;
const externalPort : number = config.nwExternalPort || 9090;
const bs : BlockStore = new BlockStore(config, internalPort);

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

app.listen(externalPort, address);
console.log(`Blockstore Server instance started, listening for:
  \t- External requests on port ${externalPort} (http://${address}:${externalPort})
  \t- Intenral communication on port ${internalPort} (http://${address}:${internalPort})`);
