const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kategori adı zorunludur'],
    unique: true,
    trim: true,
    maxlength: [50, 'Kategori adı 50 karakterden uzun olamaz']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Kategori açıklaması zorunludur'],
    maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
  },
  icon: {
    type: String, // Icon sınıfı veya URL
    default: 'fa-folder'
  },
  image: {
    type: String, // Cloudinary URL
    default: 'no-image.jpg'
  },
  parentCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  features: [{
    type: String,
    required: false
  }],
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0 // Sıralama için kullanılabilir
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
CategorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});
CategorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

CategorySchema.pre('remove', async function(next) {
  // Kategori silindiğinde alt kategorileri de sil
  await this.model('Category').deleteMany({ parentCategory: this._id });
  next();
});


module.exports = mongoose.model('Category', CategorySchema);
