const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getMyDonations,
  toggleAvailability,
  getHomeData
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/home-data', getHomeData);
router.get('/', getDonations);
router.get('/my-donations', protect, getMyDonations);
router.get('/:id', getDonationById);
router.post('/', protect, upload.array('images', 6), createDonation);
router.put('/:id', protect, upload.array('images', 6), updateDonation);
router.delete('/:id', protect, deleteDonation);
router.patch('/:id/availability', protect, toggleAvailability);

module.exports = router;
