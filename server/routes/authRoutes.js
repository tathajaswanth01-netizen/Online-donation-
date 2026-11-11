const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deactivateAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/deactivate', protect, deactivateAccount);

module.exports = router;
