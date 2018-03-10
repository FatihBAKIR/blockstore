import express = require('express');
import * as multer from 'multer';

const router = express.Router();

/*
 * Path: /posts
 * Type: GET
 * Desc: show all posts
 */
router.get('/', (req, res) => {
    res.render('posts/index', {
        title: 'Posts'
    });
});

/*
 * Path: /posts/new
 * Type: GET
 * Desc: show the form for submitting a new post
 */
router.get('/new', (req, res) => {
    res.render('posts/new', {
        title: 'Create a Post'
    });
});

/*
 * Path: /posts
 * Type: POST
 * Desc: submit a new post to be created
 */
router.post('/', (req, res, next) => {
    //TODO
});

/*
 * Path: /posts/:key
 * Type: GET
 * Desc: show a specific post along with its comments
 */
router.get('/:key', (req, res) => {
    res.render('posts/show', {
        title: 'Post'
    });
});

/*
 * Path: /posts/:key/edit
 * Type: GET
 * Desc: show a form for editing a post
 */
router.get('/:key/edit', (req, res) => {
    res.render('posts/edit', {
        title: 'Edit a Post'
    });
});

/*
 * Path: /posts/:key
 * Type: PUT
 * Desc: submit an updated post
 */
router.put('/:key', (req, res) => {
    // TODO
});

/*
 * Path: /posts/:key
 * Type: DELETE
 * Desc: delete a specific post
 */
router.delete('/:key', (req, res) => {
    // TODO
});

export = router;
