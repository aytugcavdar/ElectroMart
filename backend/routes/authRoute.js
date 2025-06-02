const express = require('express');
const {
  register,
  verifyEmail,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  deleteAccount
} = require('../controllers/authController');

const router = express.Router();

// Auth middleware'ini import et
const { protect } = require('../middlewares/authMiddeleware');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.put('/avatar', protect, uploadAvatar);
router.delete('/deleteaccount', protect, deleteAccount);

module.exports = router;
