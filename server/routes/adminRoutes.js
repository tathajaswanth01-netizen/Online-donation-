const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  reviewVerification,
  getAllDonationsAdmin,
  moderateDonation,
  getAllRequestsAdmin,
  getDonationTracking,
  getDonationTrackingDetails
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here strictly protected by admin role
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/verification', reviewVerification);
router.get('/donations', getAllDonationsAdmin);
router.put('/donations/:id/moderate', moderateDonation);
router.get('/requests', getAllRequestsAdmin);
router.get('/tracking', getDonationTracking);
router.get('/tracking/:id', getDonationTrackingDetails);

module.exports = router;
