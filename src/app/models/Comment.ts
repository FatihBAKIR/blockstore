const mongoose = require('mongoose');

// MongoDB Schema Definition
const commentSchema = new mongoose.Schema({
  id: Number,
  username: String,
  body: String
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;