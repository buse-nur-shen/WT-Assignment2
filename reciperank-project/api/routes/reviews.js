const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
 
router.post('/', auth, async (req, res) => {
  try {
    const { recipe, rating, comment } = req.body;
 
    if (!recipe || !rating || !comment) {
      return res.status(400).json({ message: 'recipe, rating, and comment are all required' });
    }
 
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }
 
    if (comment.trim().length < 3) {
      return res.status(400).json({ message: 'Comment must be at least 3 characters' });
    }
 
    const recipeExists = await Recipe.findById(recipe);
    if (!recipeExists) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
 
    const review = new Review({
      recipe,
      rating,
      comment,
      author: req.session.userId
    });
 
    await review.save();
 
    const allReviews = await Review.find({ recipe });
    const avg = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
 
    await Recipe.findByIdAndUpdate(recipe, { averageRating: avg });
 
    res.cookie('lastReviewedRecipe', recipe.toString(), {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: false
    });
 
    res.status(201).json(review);
 
  } catch (err) {
 
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this recipe' });
    }
    res.status(500).json({ message: err.message });
  }
});
 
router.get('/:recipeId', async (req, res) => {
  try {
 
    const reviews = await Review.find({ recipe: req.params.recipeId })
      .populate('author', 'username');
 
    if (reviews.length === 0) {
      return res.json({ message: 'No reviews yet for this recipe' });
    }
 
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
 
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
 
    if (review.author.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden – you can only edit your own reviews' });
    }
 
    const { rating, comment } = req.body;
 
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
      }
      review.rating = rating;
    }
 
    if (comment !== undefined) {
      if (comment.trim().length < 3) {
        return res.status(400).json({ message: 'Comment must be at least 3 characters' });
      }
      review.comment = comment;
    }
 
    await review.save();
 
    const allReviews = await Review.find({ recipe: review.recipe });
    const avg = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
    await Recipe.findByIdAndUpdate(review.recipe, { averageRating: avg });
 
    res.json(review);
 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
router.delete('/:id', auth, async (req, res) => {
  try {
 
    const review = await Review.findById(req.params.id);
 
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
 
    if (review.author.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden â€” you can only delete your own reviews' });
    }
 
    const recipeId = review.recipe;
 
    await review.deleteOne();
 
    const remainingReviews = await Review.find({ recipe: recipeId });
 
    const avg = remainingReviews.length === 0
      ? 0
      : remainingReviews.reduce((acc, item) => acc + item.rating, 0) / remainingReviews.length;
 
    await Recipe.findByIdAndUpdate(recipeId, { averageRating: avg });
 
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
module.exports = router;