const Category = require('../models/Category');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../utils/cloudinary');
const path = require('path');

// @desc    Tüm kategorileri getir
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Kök kategorileri getir (parentCategory: null)
// @route   GET /api/v1/categories/root
// @access  Public
exports.getRootCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ parentCategory: null })
    .sort('order name')
    .populate({
      path: 'subcategories',
      select: 'name slug icon image'
    });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Tek bir kategori getir
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.id;

  // Ana kategoriyi ve alt kategorilerini populate ederek çekiyoruz
  const category = await Category.findById(categoryId)
    .populate({
      path: 'subcategories',
      select: 'name slug icon image _id' // Alt kategorilerin ID'lerini de aldığımızdan emin olalım
    })
    .populate({
      path: 'parentCategory',
      select: 'name slug'
    });

  if (!category) {
    return next(
      new ErrorResponse(`${categoryId} ID'li kategori bulunamadı`, 404)
    );
  }


  let categoryIdsForProductSearch = [category._id];

  if (category.subcategories && category.subcategories.length > 0) {
    const subcategoryIds = category.subcategories.map(sub => sub._id);
    categoryIdsForProductSearch = categoryIdsForProductSearch.concat(subcategoryIds);

  }

  const allRelatedProducts = await Product.find({ category: { $in: categoryIdsForProductSearch } });


  res.status(200).json({
    success: true,
    data: category,
    products: allRelatedProducts 
  });
});

// @desc    Yeni kategori oluştur
// @route   POST /api/v1/categories
// @access  Private (Admin)
exports.createCategory = asyncHandler(async (req, res, next) => {
  // Kategori datasını al
  const { name, description, icon, parentCategory, featured, order } = req.body;
 
  
  
  // Eğer bir üst kategori seçildiyse varlığını kontrol et
  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    
    if (!parent) {
      return next(
        new ErrorResponse(`${parentCategory} ID'li üst kategori bulunamadı`, 404)
      );
    }
  }
  
  // Kategoriyi oluştur
  const category = await Category.create({
    name,
    description,
    icon,
    parentCategory,
    featured,
    order
  });

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Kategoriyi güncelle
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin)
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li kategori bulunamadı`, 404)
    );
  }

  // Eğer parentCategory güncellendiyse döngüsel referansı kontrol et
  if (req.body.parentCategory) {
    // Kategori kendisini parent olarak alamaz
    if (req.body.parentCategory.toString() === req.params.id) {
      return next(
        new ErrorResponse(`Bir kategori kendisini üst kategori olarak alamaz`, 400)
      );
    }
    
    // Alt kategorilerden birisini parent olarak alamaz (döngüsel referans)
    const isSubcategory = await checkCyclicReference(req.params.id, req.body.parentCategory);
    
    if (isSubcategory) {
      return next(
        new ErrorResponse(`Bir alt kategori, üst kategori olarak atanamaz (döngüsel referans)`, 400)
      );
    }
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Kategoriyi sil
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li kategori bulunamadı`, 404)
    );
  }

  // Bu kategoriye bağlı ürünleri kontrol et
  const products = await Product.countDocuments({ category: req.params.id });
  
  if (products > 0) {
    return next(
      new ErrorResponse(
        `Bu kategoriye bağlı ${products} ürün bulunmaktadır. Önce ürünleri silmelisiniz.`,
        400
      )
    );
  }

  // Alt kategorileri kontrol et
  const subcategories = await Category.countDocuments({ parentCategory: req.params.id });
  
  if (subcategories > 0) {
    return next(
      new ErrorResponse(
        `Bu kategorinin ${subcategories} alt kategorisi bulunmaktadır. Önce alt kategorileri silmelisiniz.`,
        400
      )
    );
  }

  // Resim cloudinary'den sil (eğer varsa)
  if (category.image && category.image !== 'no-image.jpg') {
    const public_id = category.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(public_id);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Kategori resmi yükle
// @route   PUT /api/v1/categories/:id/image
// @access  Private (Admin)
exports.uploadCategoryImage = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li kategori bulunamadı`, 404)
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

  // Eğer mevcut bir resim varsa sil
  if (category.image && category.image !== 'no-image.jpg') {
    const public_id = category.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(public_id);
  }

  // Cloudinary'ye yükle
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'categories',
    width: 600,
    crop: 'scale'
  });

  await Category.findByIdAndUpdate(req.params.id, {
    image: result.secure_url
  });

  res.status(200).json({
    success: true,
    data: result.secure_url
  });
});

// Yardımcı fonksiyon: Döngüsel referansı kontrol et
async function checkCyclicReference(categoryId, parentCategoryId) {
  // Eğer potansiyel parent ID, kontrol edilen kategori ile aynıysa
  if (categoryId === parentCategoryId.toString()) {
    return true;
  }
  
  // Potansiyel parent'ın alt kategorilerini kontrol et
  const subcategories = await Category.find({ parentCategory: parentCategoryId });
  
  // Alt kategoriler arasında döngüsel olarak kontrol et
  for (const subcategory of subcategories) {
    if (
      subcategory._id.toString() === categoryId || 
      await checkCyclicReference(categoryId, subcategory._id)
    ) {
      return true;
    }
  }
  
  return false;
}