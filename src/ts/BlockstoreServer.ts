import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');

import { Config } from "./Config";
import { BlockStore } from "./BlockStore";

const bs : BlockStore = new BlockStore(Config.LoadConfig("./config.yaml"));

const app = express();

app.disable('etag');
app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const port = 8080;
const address = '0.0.0.0';
const localhost = '127.0.0.1';

const routes = require('./BlockstoreRoutes');

app.get('/', routes.root);
app.get('/req', routes.req);
app.get('/req/get/:key', routes.get);
app.post('/req/put', routes.post);
app.put('/req/update/:key', routes.put);
app.delete('/req/delete/:key', routes.delete);
app.get('/api', routes.api);

app.listen(port, address);
console.log('Blockstore Server instance running on port ${port} (http://${localhost}:${port})');
