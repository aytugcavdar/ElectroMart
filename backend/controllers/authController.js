const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require("cloudinary").v2;

// @desc    Kullanıcı kayıt
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const exitingUser = await User.findOne({ email });

  if(exitingUser) {
    return next(new ErrorResponse('Bu email ile kayıtlı kullanıcı var', 400));
  }
  const avatar = await cloudinary.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 100,
            crop: "scale",
        });
  
  // Kullanıcı oluştur
  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' && req.user && req.user.role === 'admin' ? 'admin' : 'user',
    avatar: {
      public_id: avatar.public_id,
      url: avatar.secure_url
    }
  });

  // Email doğrulama tokeni oluştur
  const verificationToken = user.getVerificationToken();

  await user.save({ validateBeforeSave: false });

  // Email doğrulama linki oluştur
  const verifyUrl = `${req.protocol}://${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const message = `
    Merhaba ${user.name},
    
    Elektromarket hesabınızı doğrulamak için aşağıdaki linke tıklayın:
    
    ${verifyUrl}
    
    Bu linkin geçerlilik süresi 24 saattir.
    
    Teşekkürler,
    Elektromarket Ekibi
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Elektromarket - Email Doğrulama',
      message
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email gönderilemedi', 500));
  }
});

// @desc    Email doğrula
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Token'ı hash'le
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Geçersiz token', 400));
  }

  // Kullanıcıyı doğrula
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Kullanıcı girişi
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Email ve şifre kontrolü
  if (!email || !password) {
    return next(new ErrorResponse('Lütfen email ve şifre girin', 400));
  }

  // Kullanıcıyı kontrol et
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Geçersiz giriş bilgileri', 401));
  }

  // Şifre kontrolü
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Geçersiz giriş bilgileri', 401));
  }

  // Son giriş tarihini güncelle
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Çıkış yap
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mevcut kullanıcı bilgilerini getir
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Kullanıcı bilgilerini güncelle
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  };

  // Undefined alanları temizle
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Şifre güncelle
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Mevcut şifreyi kontrol et
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Mevcut şifre yanlış', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Şifre sıfırlama tokeni oluştur
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('Bu email ile kayıtlı kullanıcı yok', 404));
  }

  // Şifre sıfırlama tokeni oluştur
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Şifre sıfırlama linki oluştur
  const resetUrl = `${req.protocol}://${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

  const message = `
    Merhaba ${user.name},
    
    Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
    
    ${resetUrl}
    
    Bu linkin geçerlilik süresi 10 dakikadır.
    
    Teşekkürler,
    Elektromarket Ekibi
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Elektromarket - Şifre Sıfırlama',
      message
    });

    res.status(200).json({ success: true, data: 'Email gönderildi' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email gönderilemedi', 500));
  }
});

// @desc    Şifre sıfırlama
// @route   PUT /api/v1/auth/resetpassword/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Token'ı hash'le
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

    console.log(req.params.token,"s", resetPasswordToken,"ss");

  if (!user) {
    return next(new ErrorResponse('Geçersiz token', 400));
  }



  // Yeni şifre ayarla
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Profil fotoğrafı yükle
// @route   PUT /api/v1/auth/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!req.files || !req.files.avatar) {
    return next(new ErrorResponse('Lütfen bir dosya yükleyin', 400));
  }
  console.log(req.files,"sasadsadsad");

  const file = req.files.avatar;

  // Delete old avatar from cloudinary if exists
  if (user.avatar && user.avatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  // Resim dosyası olduğunu kontrol et
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Lütfen bir resim dosyası yükleyin', 400));
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

  // Cloudinary'ye yükle
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'avatars',
    width: 200,
    crop: 'scale'
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { 
      avatar: {
        public_id: result.public_id,
        url: result.secure_url
      }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// Token oluştur ve cookie olarak kaydet
const sendTokenResponse = (user, statusCode, res) => {
  // Token oluştur
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // HTTPS kullanılıyorsa secure seçeneğini etkinleştir
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

// @desc    Kullanıcıyı sil
// @route   DELETE /api/v1/auth/deleteaccount
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Kullanıcının avatarını sil
  if (user.avatar && user.avatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await user.remove();

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
