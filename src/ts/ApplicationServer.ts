import http = require('http');
import express = require('express');
import bodyParser = require('body-parser');
import path = require('path');

/*
 * App configuration
 */
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable('etag');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
 * Controllers (route handlers)
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/posts');
const contactController = require('./controllers/comments');

/*
 * Primary app routes
 */
app.get('/', home.index);
app.get('/posts', posts.index);
app.get('/posts/:key', posts.getPost);
app.post('/posts/new', posts.createPost);
app.get('/posts/:key/update', posts.getUpdatePost);
app.put('/posts/:key', posts.submitUpdatePost);
app.delete('/posts/:key', posts.deletePost);
app.post('/comments/new', comments.createComment);
app.get('/comments/:key/update', comments.getUpdateComment);
app.put('/comments/:key', comments.submitUpdateComment);
app.delete('/comments/:key', comments.deleteComment);

app.listen(port, localhost);
console.log('Application Server instance running on port ${port} (http://${localhost}:${port})');

module.exports = app;