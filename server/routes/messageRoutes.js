const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessagesByRequest
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/request/:requestId', protect, getMessagesByRequest);

module.exports = router;
