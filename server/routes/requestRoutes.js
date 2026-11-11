const express = require('express');
const router = express.Router();
const {
  createRequest,
  getReceiverRequests,
  getDonorIncomingRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
  getReceiverOTP,
  regenerateOTP,
  verifyCompletionOTP,
  completeDonation,
  getReceiverVerificationRequests
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);
router.get('/my-requests', protect, getReceiverRequests);
router.get('/incoming', protect, getDonorIncomingRequests);
router.get('/completion-verification', protect, getReceiverVerificationRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id/status', protect, updateRequestStatus);
router.put('/:id/cancel', protect, cancelRequest);
router.get('/:id/otp', protect, getReceiverOTP);
router.get('/:id/verification', protect, getReceiverOTP);
router.post('/:id/regenerate-otp', protect, regenerateOTP);
router.post('/:id/verify-otp', protect, verifyCompletionOTP);
router.post('/:id/complete', protect, completeDonation);

module.exports = router;
