const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

// JSON verilerini oku
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json')));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'categories.json')));
const brands = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'brands.json')));
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json')));

// Verileri içe aktar
const importData = async () => {
  try {
    // Mevcut verileri temizle
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();

    // Kullanıcıları ekle
    const createdUsers = await User.insertMany(users);
    console.log('Kullanıcılar eklendi'.green.inverse);

    // Önce parent kategorisi olmayanları ekle
    const parentCategories = categories.filter(cat => !cat.parentCategory);
    await Category.insertMany(parentCategories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      features: cat.features
    })));
    console.log('Ana kategoriler eklendi'.green.inverse);

    // Sonra child kategorileri ekle
    const childCategories = categories.filter(cat => cat.parentCategory);
    await Category.insertMany(childCategories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      parentCategory: cat.parentCategory,
      features: cat.features
    })));
    console.log('Alt kategoriler eklendi'.green.inverse);

    // Markaları ekle
    await Brand.insertMany(brands.map(brand => ({
      _id: brand._id,
      name: brand.name,
      description: brand.description
    })));
    console.log('Markalar eklendi'.green.inverse);

    // Ürünleri ekle
    const brandMap = brands.reduce((map, brand) => {
      map[brand.name] = brand._id;
      return map;
    }, {});

    const productsToInsert = products.map(product => ({
      _id: product._id,
      name: product.name,
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      specifications: product.specifications,
      images: product.images,
      brand: brandMap[product.brand], // Marka adından _id'ye çevir
      category: product.category // category zaten _id olarak geliyor
    }));

    await Product.insertMany(productsToInsert);
    console.log('Ürünler eklendi'.green.inverse);

    console.log('Veriler başarıyla içe aktarıldı'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Hata: ${error}`.red.inverse);
    process.exit(1);
  }
};

// Verileri temizle
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();

    console.log('Veriler başarıyla silindi'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Hata: ${error}`.red.inverse);
    process.exit(1);
  }
};

// Komut satırı argümanlarına göre işlem yap
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
