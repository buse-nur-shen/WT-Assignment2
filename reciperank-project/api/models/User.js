const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
 
const userSchema = new mongoose.Schema({
 
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
 
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please use a valid email']
  },
 
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  }
 
}, {
  timestamps: true
});
 
userSchema.pre('save', async function (next) {
 
  if (!this.isModified('password')) return next();
 
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
 
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
 
module.exports = mongoose.model('User', userSchema);