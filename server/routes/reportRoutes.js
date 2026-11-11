const express = require('express');
const router = express.Router();
const {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/admin', protect, authorize('admin'), getAllReports);
router.put('/admin/:id', protect, authorize('admin'), updateReportStatus);

module.exports = router;
