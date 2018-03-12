import express = require('express');
import * as multer from 'multer';
import * as bs from "bs-client";
import { Datastore } from "../models/Datastore";
import { PostB, PostM, IPostModel, GlobalUid } from "../models/Post";

const router = express.Router();

/*
 * Path: /posts
 * Type: GET
 * Desc: show all posts
 */
router.get('/', async(req, res, next) => {
  switch (req.datastore) {
    case Datastore.MongoDB:
      console.log('Request made using MongoDB...');

      const postsM = await PostM.find();

      if (postsM === null) {
        res.sendStatus(404);
        next();
        return;
      }

      res.render('posts/index', {
          title: 'Posts',
          posts: postsM
      });
      break;
    case Datastore.Blockstore:
      console.log('Request made using Blockstore...');

      const postsB = Array<PostB>();
      for (let i = 0; i < GlobalUid; i++) {
        const postStr = await req.client.Get(i.toString());
        postsB.push(PostB.Deserialize(postStr));
      }

      res.render('posts/index', {
          title: 'Posts',
          posts: postsB
      });
      break;
    default:
      console.log('ERROR: Invalid Datastore type specified');
      break;
  }
});

/*
 * Path: /posts/new
 * Type: GET
 * Desc: show the form for submitting a new post
 */
router.get('/new', (req, res, next) => {
    res.render('posts/new', {
        title: 'Create a Post'
    });
});

/*
 * Path: /posts
 * Type: POST
 * Desc: submit a new post to be created
 */
router.post('/', async(req, res, next) => {
  switch (req.datastore) {
    case Datastore.MongoDB:
      console.log('Request made using MongoDB...');

      let postM = new PostM({
        uid: GlobalUid,
        username: req.body.Username,
        title: req.body.Title,
        body: req.body.Body
      });

      postM.save((err) => {
        if (err) { return next(err); }
        res.redirect('/posts/'+postM.uid.toString());
      });
      break;
    case Datastore.Blockstore:
      console.log('Request made using Blockstore...');

      const postB = new PostB(GlobalUid, req.body.Username, req.body.Title, req.body.Body);
      PostB.PreSave();

      await req.client.Put(postB.uid.toString(), PostB.Serialize(postB));
      res.redirect('/');

      break;
    default:
      console.log('ERROR: Invalid Datastore type specified');
      break;
  }
});

/*
 * Path: /posts/:id
 * Type: GET
 * Desc: show a specific post along with its comments
 */
router.get('/:id', async(req, res, next) => {
  let post;

  switch (req.datastore) {
    case Datastore.MongoDB:
      console.log('Request made using MongoDB...');
      post = await PostM.findOne({ uid: req.params.id });
      if (post === null) {
        res.sendStatus(404);
        next();
        return;
      }
      res.render('posts/show', {
          title: 'Post #'+ post.uid.toString(),
          post: post
      });
      break;
    case Datastore.Blockstore:
      console.log('Request made using Blockstore...');
      const postStr = await req.client.Get(req.params.id);
      if (postStr === undefined) {
        res.sendStatus(404);
        next();
        return;
      }
      post = PostB.Deserialize(postStr);
      res.render('posts/show', {
          title: 'Post #'+ post.uid.toString(),
          post: post
      });
      break;
    default:
      console.log('ERROR: Invalid Datastore type specified');
      break;
  }
});

/*
 * Path: /posts/:id/edit
 * Type: GET
 * Desc: show a form for editing a post
 */
router.get('/:id/edit', async(req, res, next) => {
  let post;

  switch (req.datastore) {
    case Datastore.MongoDB:
      console.log('Request made using MongoDB...');

      post = await PostM.findOne({ uid: req.params.id });

      if (post === null) {
        res.sendStatus(404);
        next();
        return;
      }

      res.render('posts/show', {
        title: 'Edit Post #'+ post.uid.toString(),
        post: post
      });
      break;
    case Datastore.Blockstore:
      console.log('Request made using Blockstore...');
      break;
    default:
      console.log('ERROR: Invalid Datastore type specified');
      break;
  }
});

/*
 * Path: /posts/:id
 * Type: PUT
 * Desc: submit an updated post
 */
router.put('/:id', (req, res, next) => {
  switch (req.datastore) {
    case Datastore.MongoDB:
      console.log('Request made using MongoDB...');

      const post = new PostM({
        uid: GlobalUid,
        username: req.body.Username,
        title: req.body.Title,
        body: req.body.Body
      });

      post.save((err) => {
        if (err) { return next(err); }
        res.redirect('/posts/'+post.uid.toString());
      });
      break;
    case Datastore.Blockstore:
      console.log('Request made using Blockstore...');
      break;
    default:
      console.log('ERROR: Invalid Datastore type specified');
      break;
  }
});

/*
 * Path: /posts/:id
 * Type: DELETE
 * Desc: delete a specific post
 */
router.delete('/:id', (req, res) => {
  switch (req.datastore) {
    case Datastore.MongoDB:
      console.log('Request made using MongoDB...');

      PostM.remove({ uid : req.params.id });
      res.redirect('/posts');
      break;
    case Datastore.Blockstore:
      console.log('Request made using Blockstore...');
      break;
    default:
      console.log('ERROR: Invalid Datastore type specified');
      break;
  }
});

export = router;
