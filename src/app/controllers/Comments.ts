import express = require('express');
import * as multer from 'multer';

const router = express.Router();

/*
 * Path: /comments/new
 * Type: GET
 * Desc: show the form for submitting a new comment
 */
router.get('/new', (req, res) => {
    res.render('comments/new', {
        title: 'Create a Post'
    });
});

/*
 * Path: /comments
 * Type: POST
 * Desc: submit a new comment to be created
 */
router.post('/', (req, res, next) => {
    //TODO
});

/*
 * Path: /comments/:key/edit
 * Type: GET
 * Desc: show a form for editing a comment
 */
router.get('/:key/edit', (req, res) => {
    res.render('comments/edit', {
        title: 'Edit a Post'
    });
});

/*
 * Path: /comments/:key
 * Type: PUT
 * Desc: submit an updated comment
 */
router.put('/:key', (req, res) => {
    // TODO
});

/*
 * Path: /comments/:key
 * Type: DELETE
 * Desc: delete a specific comment
 */
router.delete('/:key', (req, res) => {
    // TODO
});

export = router;
