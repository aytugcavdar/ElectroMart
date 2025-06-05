// backend/models/Cart.js
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Miktar en az 1 olmalıdır'],
        default: 1
    },
    price: { // Ürünün sepete eklendiği andaki fiyatı
        type: Number,
        required: true
    },
    name: { // Kolay erişim için denormalize edilmiş ürün adı
        type: String,
        required: true
    },
    image: { // Kolay erişim için denormalize edilmiş ürün resmi URL'si
        type: String
    }
}, { _id: true }); // Her bir sepet öğesi için _id oluşturulsun

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Her kullanıcının bir sepeti olur
    },
    items: [CartItemSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

// Sepet toplam tutarını hesaplayan virtual
CartSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
});

// Sepetteki toplam ürün sayısını hesaplayan virtual
CartSchema.virtual('totalItems').get(function() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

CartSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Cart', CartSchema);