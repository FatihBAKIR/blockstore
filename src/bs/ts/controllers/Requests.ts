import express = require('express');
import * as multer from 'multer';
import { BlockStore } from '../BlockStore';

const router = express.Router();
declare global { namespace Express { export interface Request { bs: BlockStore; }}}

/*
 * Path: /req
 * Type: GET
 * Desc: returns a list of all valid operation request handling routes
 */
router.get('/', (req, res) => {
    let paths: string[] = [];
    let expr = /\/req/;

    for (let r of req.app._router.stack) {
      if (r.route && r.route.path && r.route.path.match(expr)) {
        paths.push(r.route.path)
      }
    }

    res.status(200).json(paths);
});

/*
 * Path: /req/get/:key
 * Type: GET
 * Desc: specifies a key to get its corresponding value
 */
router.get('/get/:key', (req, res) => {
    const val = req.bs.Get(req.params.key);
    res.status(200).json(val);
});

/*
 * Path: /req/put
 * Type: POST
 * Desc: submits a key-value pair to be created
 */
router.post('/put', multer().fields([]), async(req, res) => {
    req.bs.Put(req.body.key, req.body.val, Date.now());
    await req.bs.Flush();
    res.status(201).json(req.body.val);
});

/*
 * Path: /req/upd/:key
 * Type: PUT
 * Desc: submits a value to update an exisitng key-value pair
 */
router.put('/upd/:key', multer().fields([]), async(req, res) => {
    req.bs.Update(req.params.key, req.body.val, Date.now());
    await req.bs.Flush();
    res.status(200).json(req.body.val);
});

/*
 * Path: /req/del/:key
 * Type: DELETE
 * Desc: specifies a key to delete its entry
 */
router.delete('/del/:key', async(req, res) => {
    req.bs.Delete(req.params.key, Date.now());
    await req.bs.Flush();
    res.status(204).end();
});

export = router;
