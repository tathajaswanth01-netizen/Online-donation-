const mongoose = require('mongoose');

const donationEventSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationRequest',
    default: null
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actorRole: {
    type: String,
    enum: ['donor', 'receiver', 'admin', 'system'],
    default: 'system'
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'DONATION_CREATED',
      'DONATION_MODERATED',
      'REQUEST_SUBMITTED',
      'REQUEST_ACCEPTED',
      'REQUEST_REJECTED',
      'READY_FOR_PICKUP',
      'OTP_GENERATED',
      'OTP_VERIFIED',
      'DONATION_COMPLETED',
      'REQUEST_CANCELLED',
      'ITEM_HANDED_OVER'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

donationEventSchema.index({ donationId: 1, timestamp: 1 });
donationEventSchema.index({ requestId: 1, timestamp: 1 });

module.exports = mongoose.model('DonationEvent', donationEventSchema);
