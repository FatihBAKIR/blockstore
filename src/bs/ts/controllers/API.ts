import express = require('express');
import * as multer from 'multer';
import { BlockStore } from '../BlockStore';

const router = express.Router();
declare global { namespace Express { export interface Request { bs: BlockStore; }}}

/*
 * Path: /api
 * Type: GET
 * Desc: returns a list of all valid API request handling paths
 */
router.get('/', (req, res) => {
    let paths: string[] = [];
    let expr = /\/api/;

    for (let r of req.app._router.stack) {
      if (r.route && r.route.path && r.route.path.match(expr)) {
        paths.push(r.route.path)
      }
    }

    res.status(200).json(paths);
});

export = router;
