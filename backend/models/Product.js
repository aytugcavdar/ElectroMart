const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ürün başlığı zorunludur'],
    trim: true,
    maxlength: [100, 'Ürün başlığı 100 karakterden uzun olamaz']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Ürün açıklaması zorunludur'],
    maxlength: [2000, 'Açıklama 2000 karakterden uzun olamaz']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Kısa açıklama 500 karakterden uzun olamaz']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat bilgisi zorunludur'],
    min: [0, 'Fiyat negatif olamaz']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'İndirim oranı negatif olamaz'],
    max: [100, 'İndirim oranı 100\'den büyük olamaz'],
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stok bilgisi zorunludur'],
    min: [0, 'Stok miktarı negatif olamaz'],
    default: 0
  },
  brand: {
    type: mongoose.Schema.ObjectId,
    ref: 'Brand',
    required: [true, 'Lütfen bir marka seçin']
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Lütfen bir kategori seçin']
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      public_id: String,
      isMain: {
        type: Boolean,
        default: false
      }
    }
  ],
  specifications: [
    {
      name: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }
  ],
  rating: {
    type: Number,
    min: [0, 'Puan 0\'dan küçük olamaz'],
    max: [5, 'Puan 5\'ten büyük olamaz'],
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isNewProduct: {
    type: Boolean,
    default: true
  },
  isSale: {
    type: Boolean,
    default: false
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'SKU zorunludur']
  },
  warranty: {
    type: Number, // Ay cinsinden
    default: 24
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Slug oluştur
ProductSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// İndirimli fiyatı hesapla
ProductSchema.virtual('discountedPrice').get(function() {
  return this.price * (1 - this.discountPercentage / 100);
});

// Stok durumu
ProductSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

module.exports = mongoose.model('Product', ProductSchema);