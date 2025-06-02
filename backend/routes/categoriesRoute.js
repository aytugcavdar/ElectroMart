const express = require('express');
const {
  getCategories,
  getRootCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage
} = require('../controllers/categoryController');

const router = express.Router();

// Middleware'leri import et
const { protect, authorize } = require('../middlewares/authMiddeleware');
const advancedResults = require('../middlewares/advancedResults');
const Category = require('../models/Category');

router
  .route('/')
  .get(
    advancedResults(Category, [
      { path: 'subcategories', select: 'name slug icon image' },
      { path: 'products', select: 'name slug price image' },
      { path: 'parentCategory', select: 'name slug icon image' }
      
    ]), 
    getCategories
  )
  .post(protect, authorize('admin'), createCategory);

// Kök kategorileri getir
router.get('/root', getRootCategories);

router
  .route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

router
  .route('/:id/image')
  .put(protect, authorize('admin'), uploadCategoryImage);

module.exports = router;
