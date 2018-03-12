import express = require('express');
import * as multer from 'multer';
import mongoose = require("mongoose");
const Schema = mongoose.Schema;

interface INode
{
    key: string;
    val: string;
}

const theSchema = new Schema({
    key: Schema.Types.String,
    val: Schema.Types.String
});

interface IModel extends INode, mongoose.Document {}
var Stuff = mongoose.model<IModel>("things", theSchema);

mongoose.Promise = Promise;
mongoose.connect(`mongodb://178.62.119.87:27017/db`, {server: {
    'reconnectTries': Number.MAX_VALUE, // Hopefully this will keep out connection open forever.
    socketOptions: {
        'autoReconnect': true,
        'keepAlive': 30000,
        'connectTimeoutMS': 3000
    }
}});

const router = express.Router();

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
router.get('/get/:key', async (req, res) => {
    const value = await Stuff.findOne({ 'key': req.params.key });
    if (!value)
    {
        res.status(200);
        res.send("undefined");
        return;
    }
    const v = value.val;
    console.log(v);
    res.status(200).json(v);
});

/*
 * Path: /req/put
 * Type: POST
 * Desc: submits a key-value pair to be created
 */
router.post('/put', multer().fields([]), async(req, res) => {
    await Stuff.create({
        key : req.body.key,
        val : req.body.val 
    })
    res.status(201).json(req.body.val);
});

/*
 * Path: /req/upd/:key
 * Type: PUT
 * Desc: submits a value to update an exisitng key-value pair
 */
router.put('/upd/:key', multer().fields([]), async(req, res) => {
    const thing = await Stuff.findOne({ 'key': req.params.key });
    if (!thing)
    {
        res.status(404);
        res.send();
        return;
    }
    thing.val = req.body.val;
    await thing.save();
    res.status(200).json(req.body.val);
});

/*
 * Path: /req/del/:key
 * Type: DELETE
 * Desc: specifies a key to delete its entry
 */
router.delete('/del/:key', multer().fields([]), async(req, res) => {
    const thing = await Stuff.findOne({ 'key': req.params.key });
    if (!thing)
    {
        res.status(404);
        res.send();
        return;
    }
    await Stuff.deleteOne({ "_id": thing._id });
    res.status(204).end();
});

export = router;
