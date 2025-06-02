const mongoose = require('mongoose');
const slugify = require('slugify');

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Marka adı zorunludur'],
    unique: true,
    trim: true,
    maxlength: [50, 'Marka adı 50 karakterden uzun olamaz']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Marka açıklaması zorunludur'],
    maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
  },
  logo: {
    type: String, // Cloudinary URL
    default: 'no-logo.png'
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Lütfen geçerli bir URL girin'
    ]
  },
  foundedYear: {
    type: Number,
    min: [1800, 'Kuruluş yılı 1800\'den küçük olamaz'],
    max: [new Date().getFullYear(), 'Kuruluş yılı gelecekte olamaz']
  },
  featured: {
    type: Boolean,
    default: false
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
BrandSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Bu markaya ait ürünleri getir (virtual populate)
BrandSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand',
  justOne: false
});

module.exports = mongoose.model('Brand', BrandSchema);