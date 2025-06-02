const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur']
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir email adresi girin'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    match: [
      /^(\+90|0)?[0-9]{10}$/,
      'Lütfen geçerli bir telefon numarası girin'
    ]
  },
  address: {
    city: String,
    district: String,
    street: String,
    postalCode: String,
    fullAddress: String
  },
  avatar: {
        public_id: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        },
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Şifreyi hashle
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT token oluştur
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Şifreleri karşılaştır
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Email doğrulama tokeni oluştur
UserSchema.methods.getVerificationToken = function() {
  // Token oluştur
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Token'ı hashle ve veritabanına kaydet
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Token geçerlilik süresi (24 saat)
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Şifre sıfırlama tokeni oluştur
UserSchema.methods.getResetPasswordToken = function() {
  // Token oluştur
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Token'ı hashle ve veritabanına kaydet
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token geçerlilik süresi (10 dakika)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
