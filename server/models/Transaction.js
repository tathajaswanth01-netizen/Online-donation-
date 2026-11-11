const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationRequest',
    required: true
  },
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Pickup', 'Online Direct Transfer', 'UPI / Card Mock Gateway'],
    default: 'Cash on Pickup'
  },
  paymentReference: {
    type: String,
    default: () => 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
