const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
 
router.get('/', async (req, res) => {
  try {
 
    const filter = {};
 
    if (req.query.category) {
      filter.category = req.query.category;
    }
 
    if (req.query.subcategory) {
      filter.subcategory = req.query.subcategory;
    }
 
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
 
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }
 
    if (req.query.dietary) {
      filter.dietaryRequirements = { $in: [req.query.dietary] };
    }
 
    const recipes = await Recipe.find(filter).populate('author', 'username');
 
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
router.get('/compare', async (req, res) => {
  try {
    const { ids } = req.query;
 
    if (!ids) {
      return res.status(400).json({ message: 'ids query parameter is required (comma-separated recipe IDs)' });
    }
 
    const idArray = ids.split(',').map(id => id.trim());
 
    if (idArray.length < 2) {
      return res.status(400).json({ message: 'At least 2 recipe IDs are required for comparison' });
    }
 
    if (idArray.length > 4) {
      return res.status(400).json({ message: 'A maximum of 4 recipes can be compared at once' });
    }
 
    const recipes = await Recipe.find({ _id: { $in: idArray } }).populate('author', 'username');
 
    if (recipes.length < 2) {
      return res.status(404).json({ message: 'One or more recipes not found' });
    }
 
    const comparison = recipes.map(recipe => ({
      _id: recipe._id,
      title: recipe.title,
      category: recipe.category,
      subcategory: recipe.subcategory || null,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      averageRating: recipe.averageRating,
      ingredientCount: recipe.ingredients.length,
      stepCount: recipe.steps.length,
      dietaryRequirements: recipe.dietaryRequirements,
      author: recipe.author
    }));
 
    const recommended = comparison.reduce((best, current) =>
      current.averageRating > best.averageRating ? current : best
    );
 
    res.json({ recipes: comparison, recommended: recommended._id });
 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
router.get('/:id', async (req, res) => {
  try {
 
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username');
 
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
 
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
router.post('/', auth, async (req, res) => {
  try {
    const { title, ingredients, steps, cookingTime, servings, difficulty, category, subcategory } = req.body;
 
    if (!title || !ingredients || !steps || !cookingTime || !servings || !difficulty || !category) {
      return res.status(400).json({ message: 'title, ingredients, steps, cookingTime, servings, difficulty, and category are all required' });
    }
 
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Ingredients must be a non-empty array' });
    }
 
    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ message: 'Steps must be a non-empty array' });
    }
 
    if (!['cooking', 'baking'].includes(category)) {
      return res.status(400).json({ message: 'Category must be cooking or baking' });
    }
 
    if (category === 'baking' && !subcategory) {
      return res.status(400).json({ message: 'Subcategory is required for baking recipes' });
    }
 
    if (subcategory) {
      const bakingSubcategories = ['cakes', 'cookies', 'breads', 'pastries', 'desserts'];
      const cookingSubcategories = ['breakfast', 'lunch', 'dinner'];
      if (category === 'baking' && !bakingSubcategories.includes(subcategory)) {
        return res.status(400).json({ message: 'Baking subcategory must be one of: cakes, cookies, breads, pastries, desserts' });
      }
      if (category === 'cooking' && !cookingSubcategories.includes(subcategory)) {
        return res.status(400).json({ message: 'Cooking subcategory must be one of: breakfast, lunch, dinner' });
      }
    }
 
    const recipe = new Recipe({
      ...req.body,
      author: req.session.userId
    });
 
    await recipe.save();
 
    res.status(201).json(recipe);
 
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
 
router.put('/:id', auth, async (req, res) => {
  try {
 
    const recipe = await Recipe.findById(req.params.id);
 
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
 
    if (recipe.author.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden â€” you can only edit your own recipes' });
    }
 
    if (req.body.category === 'baking' && !req.body.subcategory && !recipe.subcategory) {
      return res.status(400).json({ message: 'Subcategory is required for baking recipes' });
    }
 
    Object.assign(recipe, req.body);
 
    await recipe.save();
 
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
 
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
 
    if (recipe.author.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Forbidden â€” you can only delete your own recipes' });
    }
 
    await recipe.deleteOne();
 
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
module.exports = router;