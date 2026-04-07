const mongoose = require('mongoose');
 
const reviewSchema = new mongoose.Schema({
 
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Recipe ID is required']
  },
 
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
 
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
 
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    minlength: [3, 'Comment must be at least 3 characters']
  }
 
}, {
 
  timestamps: true
});
 
reviewSchema.index({ recipe: 1, author: 1 }, { unique: true });
 
module.exports = mongoose.model('Review', reviewSchema);