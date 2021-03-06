import http = require('http');
import express = require('express');
const session = require('express-session');
import bodyParser = require('body-parser');
import path = require('path');
const dotenv = require('dotenv');
const mongoStore = require('connect-mongo')(session);
import mongoose = require('mongoose');
import { Datastore } from "./models/Datastore";
import * as bs from "bs-client";

/*
 * Load environment variables from .env file, where API keys and passwords are configured
 */
dotenv.load({ path: '.env' });

const port : number = parseInt(process.env.PORT || process.argv[2]) || 7070;
const address : string = '127.0.0.1';
const datastore = Datastore.Blockstore;
const client = new bs.BlockStoreClient("198.199.108.184", 9090);
declare global { namespace Express { export interface Request { datastore: Datastore, client: bs.BlockStoreClient; }}}
const app = express();

/*
 * Connect to MongoDB
 */
let uri : string = String(process.env.MONGODB_URI) || String(process.env.MONGOLAB_URI);
mongoose.Promise = global.Promise;
mongoose.connect(uri);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

/*
 * App Configuration
 */
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.datastore = datastore;
    req.client = client;
    next();
});
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new mongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/*
 * Controllers
 */
import posts = require('./controllers/Posts');

/*
 * Routes
 */
app.use('/posts', posts);

/*
 * Path: /
 * Type: GET
 * Desc: returns a home page listing posts
 */
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home'
    });
});

app.listen(port, address);
console.log(`Application Server instance running on port ${port} (http://${address}:${port})`);
