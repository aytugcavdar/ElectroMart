// backend/routes/cartRoute.js
const express = require('express');
const {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddeleware'); // İsmin 'authMiddleware' olduğundan emin olun

const router = express.Router();

router.use(protect); // Tüm sepet rotaları için koruma

router.route('/')
    .get(getCart)
    .post(addItemToCart)
    .delete(clearCart);

router.route('/:itemId')
    .put(updateCartItem)
    .delete(removeCartItem);

module.exports = router;