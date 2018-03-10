import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');
import path = require('path');

const port : number = parseInt(process.argv[2]) || 5050;
const address :string = '127.0.0.1';

/*
 * App Configuration
 */
const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
 * Controllers
 */
import posts = require('./controllers/Posts');
import comments = require('./controllers/Comments');

/*
 * Routes
 */
app.use('/posts', posts);
app.use('/comments', comments);

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
