const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model('User', UserSchema);
