const express = require('express');
const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandLogo
} = require('../controllers/brandController');

const router = express.Router();

// Middleware'leri import et
const { protect, authorize } = require('../middlewares/authMiddeleware');
const advancedResults = require('../middlewares/advancedResults');
const Brand = require('../models/Brand');

router
  .route('/')
  .get(advancedResults(Brand), getBrands)
  .post(protect, authorize('admin'), createBrand);

router
  .route('/:id')
  .get(getBrand)
  .put(protect, authorize('admin'), updateBrand)
  .delete(protect, authorize('admin'), deleteBrand);

router
  .route('/:id/logo')
  .put(protect, authorize('admin'), uploadBrandLogo);

module.exports = router;
