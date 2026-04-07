const mongoose = require('mongoose');
 
const recipeSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
 
  ingredients: {
    type: [String],
    required: [true, 'Ingredients are required']
  },
 
  steps: {
    type: [String],
    required: [true, 'Steps are required']
  },
 
  cookingTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [1, 'Cooking time must be at least 1 minute']
  },
 
  servings: {
    type: Number,
    required: [true, 'Servings is required'],
    min: [1, 'Servings must be at least 1']
  },
 
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium, or hard'
    },
    required: [true, 'Difficulty is required']
  },
 
  category: {
    type: String,
    enum: {
      values: ['cooking', 'baking'],
      message: 'Category must be cooking or baking'
    },
    required: [true, 'Category is required']
  },
 
  subcategory: {
    type: String,
    enum: {
      values: ['cakes', 'cookies', 'breads', 'pastries', 'desserts', 'breakfast', 'lunch', 'dinner'],
      message: 'Subcategory must be one of: cakes, cookies, breads, pastries, desserts, breakfast, lunch, dinner'
    },
    required: [function () {
      return this.category === 'baking';
    }, 'Subcategory is required for baking recipes']
  },
 
  dietaryRequirements: {
    type: [String],
    default: []
  },
 
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
 
  averageRating: {
    type: Number,
    default: 0
  }
 
}, {
 
  timestamps: true
});
 
module.exports = mongoose.model('Recipe', recipeSchema);