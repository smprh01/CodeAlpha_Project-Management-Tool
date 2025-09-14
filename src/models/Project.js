const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lists: [{ name: String, order: Number }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
