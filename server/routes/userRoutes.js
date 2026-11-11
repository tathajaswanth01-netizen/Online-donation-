const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  submitVerification,
  getVerificationStatus
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile/:id', getUserProfile);
router.post('/verify', protect, upload.single('documentFile'), submitVerification);
router.get('/verification-status', protect, getVerificationStatus);

module.exports = router;
