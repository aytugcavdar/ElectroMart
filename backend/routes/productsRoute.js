const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  setMainImage
} = require('../controllers/productController');

const router = express.Router({ mergeParams: true });

// Middleware'leri import et
const { protect, authorize } = require('../middlewares/authMiddeleware');
const advancedResults = require('../middlewares/advancedResults');
const Product = require('../models/Product');

router
  .route('/')
  .get(advancedResults(Product, [
    { path: 'brand', select: 'name logo' },
    { path: 'category', select: 'name icon' }
  ]), getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router
  .route('/:id/images')
  .post(protect, authorize('admin'), uploadProductImages);

router
  .route('/:id/images/:imageId')
  .delete(protect, authorize('admin'), deleteProductImage);

router
  .route('/:id/images/:imageId/main')
  .put(protect, authorize('admin'), setMainImage);

module.exports = router;
