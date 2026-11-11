const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'request_received',
      'request_accepted',
      'request_rejected',
      'request_cancelled',
      'ready_for_pickup',
      'handed_over',
      'donation_completed',
      'verification_updated',
      'moderation',
      'moderation_update',
      'new_message',
      'report_resolved',
      'system'
    ],
    default: 'system'
  },
  relatedDonationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  relatedRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationRequest'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
