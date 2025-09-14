const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  listName: String,
  assignee: { type: Schema.Types.ObjectId, ref: 'User' },
  order: Number,
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
