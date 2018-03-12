import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');

const address : string = '0.0.0.0';

/*
 * App Configuration
 */
const app = express();
app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
 * Controllers
 */
import requests = require('./controllers/Requests');

/*
 * Routes
 */
app.use('/req', requests);

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

app.listen(9090, address);
