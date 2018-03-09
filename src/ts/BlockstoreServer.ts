import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');

import { Config } from "./Config";
import { BlockStore } from "./BlockStore";

const bs : BlockStore = new BlockStore(Config.LoadConfig("./config.yaml"), 3000);

const app = express();

app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;
const localhost = '127.0.0.1';

const routes = require('./BlockstoreRoutes');

app.get('/', routes.root);
app.get('/req', routes.req);
app.get('/req/get/:key', routes.reqGet);
app.post('/req/put', routes.reqPut);
app.put('/req/upd/:key', routes.reqUpd);
app.delete('/req/del/:key', routes.reqDel);
app.get('/api', routes.api);

app.listen(port, localhost);
console.log('Blockstore Server instance running on port ${port} (http://${localhost}:${port})');
