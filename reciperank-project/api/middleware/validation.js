const validateRating = (rating) => {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return 'Rating must be a number between 1 and 5';
    }
    return null;
  };
   
  const validateComment = (comment) => {
    if (!comment || comment.trim().length < 3) {
      return 'Comment must be at least 3 characters';
    }
    return null;
  };
   
  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };
   
  const validateRecipeCategory = (category, subcategory) => {
    const validCategories = ['cooking', 'baking'];
    if (!validCategories.includes(category)) {
      return 'Category must be cooking or baking';
    }
    if (category === 'baking' && !subcategory) {
      return 'Subcategory is required for baking recipes';
    }
    return null;
  };
   
  module.exports = { validateRating, validateComment, validatePassword, validateRecipeCategory };
   