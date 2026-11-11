const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedQuantity: {
    type: Number,
    required: [true, 'Please specify requested quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  reason: {
    type: String,
    required: [true, 'Please provide the reason for your request'],
    maxlength: 1000
  },
  intendedUse: {
    type: String,
    required: [true, 'Please explain intended use'],
    maxlength: 1000
  },
  message: {
    type: String,
    default: ''
  },
  preferredPickupMethod: {
    type: String,
    enum: ['Self Pickup', 'Courier / Delivery', 'Community Drop-off Point'],
    default: 'Self Pickup'
  },
  contactPreference: {
    type: String,
    enum: ['Platform Chat', 'Phone Call', 'WhatsApp', 'Email'],
    default: 'Platform Chat'
  },
  agreedPrice: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['N/A', 'Pending', 'Paid', 'Cash on Pickup'],
    default: 'N/A'
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Ready for Pickup', 'Handed Over', 'Completed'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  donorNotes: {
    type: String,
    default: ''
  },
  // OTP Verification Fields
  otpHash: {
    type: String,
    default: null
  },
  otpEncrypted: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  otpVerifiedAt: {
    type: Date,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  lastOtpGeneratedAt: {
    type: Date,
    default: null
  },
  // Process Lifecycle Timestamps
  acceptedAt: Date,
  readyForPickupAt: Date,
  handoverDate: Date,
  completedDate: Date,
  completedAt: Date,
  cancelledAt: Date,
  rejectedAt: Date
}, {
  timestamps: true
});

donationRequestSchema.index({ donationId: 1, receiverId: 1 });
donationRequestSchema.index({ donorId: 1, status: 1 });
donationRequestSchema.index({ receiverId: 1, status: 1 });
donationRequestSchema.index({ otpExpiresAt: 1, otpVerified: 1 });

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
