// backend/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Kullanıcının sepetini getir
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
        path: 'items.product',
        select: 'title images stock' // İhtiyaç duyulan ürün alanlarını seçin
    });

    if (!cart) {
        // Eğer kullanıcının sepeti yoksa, boş bir sepet oluştur ve döndür
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Sepete ürün ekle veya miktarı güncelle
// @route   POST /api/v1/cart
// @access  Private
exports.addItemToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity, price, name, image } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || !price || !name) {
        return next(new ErrorResponse('Lütfen ürün ID, miktar, fiyat ve isim bilgilerini sağlayın', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorResponse(`Ürün bulunamadı: ${productId}`, 404));
    }

    if (product.stock < quantity) {
        return next(new ErrorResponse(`Yetersiz stok. ${product.title} için kalan stok: ${product.stock}`, 400));
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Ürün zaten sepette, miktarı güncelle
        cart.items[itemIndex].quantity += Number(quantity);
         if (product.stock < cart.items[itemIndex].quantity) {
            return next(new ErrorResponse(`Yetersiz stok. ${product.title} için kalan stok: ${product.stock}. Sepetinizde zaten ${cart.items[itemIndex].quantity - Number(quantity)} adet var.`, 400));
        }
        cart.items[itemIndex].price = Number(price); // Fiyatı her zaman güncelle (promosyon vs. olabilir)
    } else {
        // Yeni ürün ekle
        cart.items.push({ product: productId, quantity: Number(quantity), price: Number(price), name, image });
    }

    await cart.save();
    // Populate ile güncel sepeti döndür
    const populatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'title images stock'
    });
    res.status(200).json({ success: true, data: populatedCart });
});

// @desc    Sepetteki bir ürünün miktarını güncelle
// @route   PUT /api/v1/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;
    const itemId = req.params.itemId; // Bu, CartItemSchema'nın _id'si olmalı
    const userId = req.user.id;

    if (!quantity || Number(quantity) < 1) {
        return next(new ErrorResponse('Geçerli bir miktar girin (en az 1)', 400));
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return next(new ErrorResponse('Sepet bulunamadı', 404));
    }

    const item = cart.items.id(itemId);
    if (!item) {
        return next(new ErrorResponse(`Sepet öğesi bulunamadı: ${itemId}`, 404));
    }

    const product = await Product.findById(item.product);
    if (!product) {
        return next(new ErrorResponse(`Ürün bulunamadı: ${item.product}`, 404));
    }
    if (product.stock < quantity) {
        return next(new ErrorResponse(`Yetersiz stok. ${product.title} için kalan stok: ${product.stock}`, 400));
    }

    item.quantity = Number(quantity);
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'title images stock'
    });
    res.status(200).json({ success: true, data: populatedCart });
});

// @desc    Sepetten ürün sil
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
exports.removeCartItem = asyncHandler(async (req, res, next) => {
    const itemId = req.params.itemId;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return next(new ErrorResponse('Sepet bulunamadı', 404));
    }

    const item = cart.items.id(itemId);
    if (!item) {
        return next(new ErrorResponse(`Sepet öğesi bulunamadı: ${itemId}`, 404));
    }

    item.deleteOne(); // Mongoose 8+ için
    // Eski Mongoose versiyonları için: item.remove();

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'title images stock'
    });
    res.status(200).json({ success: true, data: populatedCart });
});

// @desc    Sepeti temizle
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return next(new ErrorResponse('Sepet bulunamadı', 404));
    }

    cart.items = [];
    await cart.save();
    res.status(200).json({ success: true, data: cart });
});