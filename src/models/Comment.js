const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  text: String,
  task: { type: Schema.Types.ObjectId, ref: 'Task' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);
