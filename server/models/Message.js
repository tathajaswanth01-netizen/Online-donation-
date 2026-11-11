const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationRequest',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    trim: true,
    maxlength: 2000
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ requestId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
