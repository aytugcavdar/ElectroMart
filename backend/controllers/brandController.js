const Brand = require('../models/Brand');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../utils/cloudinary');
const path = require('path');

// @desc    Tüm markaları getir
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Tek bir marka getir
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id).populate({
    path: 'products',
    select: 'title price',
  });

  if (!brand) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li marka bulunamadı`, 404)
    );
  }


  res.status(200).json({
    success: true,
    data: brand,
    
  });
});

// @desc    Yeni marka oluştur
// @route   POST /api/v1/brands
// @access  Private (Admin)
exports.createBrand = asyncHandler(async (req, res, next) => {
  // Marka datasını al
  const { name, description, website, foundedYear } = req.body;
  
  // Markayı oluştur
  const brand = await Brand.create({
    name,
    description,
    website,
    foundedYear
  });

  res.status(201).json({
    success: true,
    data: brand
  });
});

// @desc    Markayı güncelle
// @route   PUT /api/v1/brands/:id
// @access  Private (Admin)
exports.updateBrand = asyncHandler(async (req, res, next) => {
  let brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li marka bulunamadı`, 404)
    );
  }

  brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: brand
  });
});

// @desc    Markayı sil
// @route   DELETE /api/v1/brands/:id
// @access  Private (Admin)
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);


  if (!brand) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li marka bulunamadı`, 404)
    );
  }

  // Bu markaya bağlı ürünleri kontrol et
  const products = await Product.countDocuments({ brand: req.params.id });
  
  if (products > 0) {
    return next(
      new ErrorResponse(
        `Bu markaya bağlı ${products} ürün bulunmaktadır. Önce ürünleri silmelisiniz.`,
        400
      )
    );
  }

  // Logo cloudinary'den sil (eğer varsa)
  if (brand.logo && brand.logo !== 'no-logo.png') {
    const public_id = brand.logo.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(public_id);
  }

  await Brand.findByIdAndDelete(req.params.id);
  // Eğer logo yoksa, varsayılan logo ayarla

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Marka logosu yükle
// @route   PUT /api/v1/brands/:id/logo
// @access  Private (Admin)
exports.uploadBrandLogo = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li marka bulunamadı`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Lütfen bir dosya yükleyin`, 400));
  }

  const file = req.files.file;

  // Resim dosyası olduğunu kontrol et
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Lütfen bir resim dosyası yükleyin`, 400));
  }

  // Dosya boyutunu kontrol et
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Lütfen ${process.env.MAX_FILE_UPLOAD / 1000000}MB'den küçük bir dosya yükleyin`,
        400
      )
    );
  }

  // Eğer mevcut bir logo varsa sil
  if (brand.logo && brand.logo !== 'no-logo.png') {
    const public_id = brand.logo.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(public_id);
  }

  // Cloudinary'ye yükle
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'brands',
    width: 200,
    crop: 'scale'
  });

  await Brand.findByIdAndUpdate(req.params.id, {
    logo: result.secure_url
  });

  res.status(200).json({
    success: true,
    data: result.secure_url
  });
});