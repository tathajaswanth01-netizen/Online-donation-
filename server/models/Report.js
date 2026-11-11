const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  reason: {
    type: String,
    required: [true, 'Please provide the report reason'],
    enum: [
      'Suspected Resale for Profit',
      'Misleading Description / Condition',
      'Commercial Seller masquerading as Donor',
      'Inappropriate or Prohibited Item',
      'Harassment or Fraud',
      'No-Show / Unresponsive Handover',
      'Other Violation'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please provide detailed context for this report'],
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Investigation', 'Resolved', 'Dismissed'],
    default: 'Pending'
  },
  adminAction: {
    type: String,
    enum: ['None', 'Warning Sent', 'Listing Removed', 'User Suspended', 'Report Dismissed'],
    default: 'None'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date
}, {
  timestamps: true
});

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
