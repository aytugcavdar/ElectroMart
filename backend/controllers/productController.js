const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../utils/cloudinary');
const path = require('path');

// @desc    Tüm ürünleri getir
// @route   GET /api/v1/products
// @route   GET /api/v1/brands/:brandId/products
// @route   GET /api/v1/categories/:categoryId/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  // Özel rotalar için filtreleme
  if (req.params.brandId) {
    // Markanın varlığını kontrol et
    const brand = await Brand.findById(req.params.brandId);
    
    if (!brand) {
      return next(
        new ErrorResponse(`${req.params.brandId} ID'li marka bulunamadı`, 404)
      );
    }
    
    const products = await Product.find({ brand: req.params.brandId });
    
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  }
  
  if (req.params.categoryId) {
    // Kategorinin varlığını kontrol et
    const category = await Category.findById(req.params.categoryId);
    
    if (!category) {
      return next(
        new ErrorResponse(`${req.params.categoryId} ID'li kategori bulunamadı`, 404)
      );
    }
    
    const products = await Product.find({ category: req.params.categoryId });
    
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  }
  
  // Standart advancedResults middleware'i kullan
  res.status(200).json(res.advancedResults);
});

// @desc    Tek bir ürün getir
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path:'category',
    populate: {
      path: 'parentCategory',
      model: 'Category'
    }
  }).populate('brand');

  if (!product) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li ürün bulunamadı`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Yeni ürün oluştur
// @route   POST /api/v1/products
// @access  Private (Admin)
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Ürün datasını al
  const {
    title,
    description,
    shortDescription,
    price,
    discountPercentage,
    stock,
    brand,
    category,
    specifications,
    warranty,
    featured,
    isNew,
    isSale,
    sku
  } = req.body;
  
  // Marka ve kategori kontrolü
  const brandExists = await Brand.findById(brand);
  if (!brandExists) {
    return next(
      new ErrorResponse(`${brand} ID'li marka bulunamadı`, 404)
    );
  }
  
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(
      new ErrorResponse(`${category} ID'li kategori bulunamadı`, 404)
    );
  }
  
  // SKU kontrolü
  const skuExists = await Product.findOne({ sku });
  if (skuExists) {
    return next(
      new ErrorResponse(`${sku} SKU'ya sahip başka bir ürün zaten var`, 400)
    );
  }
  
  // Ürünü oluştur
  const product = await Product.create({
    title,
    description,
    shortDescription,
    price,
    discountPercentage,
    stock,
    brand,
    category,
    specifications,
    warranty,
    featured,
    isNew,
    isSale,
    sku,
    images: [] // Başlangıçta boş, sonradan eklenecek
  });

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Ürünü güncelle
// @route   PUT /api/v1/products/:id
// @access  Private (Admin)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li ürün bulunamadı`, 404)
    );
  }
  
  // SKU güncelleniyorsa ve başka bir ürün tarafından kullanılıyorsa kontrol et
  if (req.body.sku && req.body.sku !== product.sku) {
    const skuExists = await Product.findOne({ sku: req.body.sku });
    if (skuExists) {
      return next(
        new ErrorResponse(`${req.body.sku} SKU'ya sahip başka bir ürün zaten var`, 400)
      );
    }
  }
  
  // Marka güncelleniyorsa varlığını kontrol et
  if (req.body.brand && req.body.brand !== product.brand.toString()) {
    const brandExists = await Brand.findById(req.body.brand);
    if (!brandExists) {
      return next(
        new ErrorResponse(`${req.body.brand} ID'li marka bulunamadı`, 404)
      );
    }
  }
  
  // Kategori güncelleniyorsa varlığını kontrol et
  if (req.body.category && req.body.category !== product.category.toString()) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return next(
        new ErrorResponse(`${req.body.category} ID'li kategori bulunamadı`, 404)
      );
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Ürünü sil
// @route   DELETE /api/v1/products/:id
// @access  Private (Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li ürün bulunamadı`, 404)
    );
  }

  // Ürün resimlerini Cloudinary'den sil
  for (let image of product.images) {
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }

  await product.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Ürün resmi yükle
// @route   POST /api/v1/products/:id/images
// @access  Private (Admin)
exports.uploadProductImages = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li ürün bulunamadı`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Lütfen bir dosya yükleyin`, 400));
  }

  // Tek bir resim mi yoksa birden fazla mı?
  const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
  
  const uploadedImages = [];
  
  // Her bir resmi yükle
  for (const file of files) {
    // Resim dosyası olduğunu kontrol et
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Lütfen resim dosyaları yükleyin`, 400));
    }

    // Dosya boyutunu kontrol et
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Lütfen ${process.env.MAX_FILE_UPLOAD / 1000000}MB'den küçük dosyalar yükleyin`,
          400
        )
      );
    }

    // Cloudinary'ye yükle
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `products/${product._id}`,
      width: 1000,
      crop: 'scale'
    });
    
    // Resim bilgisini kaydet
    const imageData = {
      url: result.secure_url,
      public_id: result.public_id,
      isMain: product.images.length === 0 // İlk resimse ana resim olarak işaretle
    };
    
    uploadedImages.push(imageData);
  }
  
  // Resimleri ürüne ekle
  product.images = [...product.images, ...uploadedImages];
  await product.save();

  res.status(200).json({
    success: true,
    count: uploadedImages.length,
    data: product.images
  });
});

// @desc    Ürün resmini sil
// @route   DELETE /api/v1/products/:id/images/:imageId
// @access  Private (Admin)
exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li ürün bulunamadı`, 404)
    );
  }
  
  // Resmin ürüne ait olup olmadığını kontrol et
  const imageIndex = product.images.findIndex(
    image => image._id.toString() === req.params.imageId
  );
  
  if (imageIndex === -1) {
    return next(
      new ErrorResponse(`${req.params.imageId} ID'li resim bulunamadı`, 404)
    );
  }
  
  const image = product.images[imageIndex];
  
  // Ana resim mi kontrol et
  if (image.isMain && product.images.length > 1) {
    return next(
      new ErrorResponse(`Ana resim silinemez. Önce başka bir resmi ana resim olarak ayarlayın.`, 400)
    );
  }
  
  // Cloudinary'den sil
  if (image.public_id) {
    await cloudinary.uploader.destroy(image.public_id);
  }
  
  // Ürünün resim dizisinden kaldır
  product.images.splice(imageIndex, 1);
  
  // Eğer son resim silindiyse ve başka resimler varsa, ilk resmi ana resim olarak ayarla
  if (image.isMain && product.images.length > 0) {
    product.images[0].isMain = true;
  }
  
  await product.save();

  res.status(200).json({
    success: true,
    data: product.images
  });
});

// @desc    Ana resmi ayarla
// @route   PUT /api/v1/products/:id/images/:imageId/main
// @access  Private (Admin)
exports.setMainImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`${req.params.id} ID'li ürün bulunamadı`, 404)
    );
  }
  
  // Resmin ürüne ait olup olmadığını kontrol et
  const imageIndex = product.images.findIndex(
    image => image._id.toString() === req.params.imageId
  );
  
  if (imageIndex === -1) {
    return next(
      new ErrorResponse(`${req.params.imageId} ID'li resim bulunamadı`, 404)
    );
  }
  
  // Tüm resimlerin isMain özelliğini false yap
  product.images.forEach(image => {
    image.isMain = false;
  });
  
  // Seçilen resmi ana resim olarak ayarla
  product.images[imageIndex].isMain = true;
  
  await product.save();

  res.status(200).json({
    success: true,
    data: product.images
  });
});