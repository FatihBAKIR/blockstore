import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');

const app = express();
app.disable("etag");
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const port = 8080;
app.listen(port, "0.0.0.0");

app.get("/", (req, res) => {
    res.json("yo");
});

app.post("/put", (req, res) => {
    console.log(req.body);
    res.json(req.body);
});

console.log(`running on ${port}`);
