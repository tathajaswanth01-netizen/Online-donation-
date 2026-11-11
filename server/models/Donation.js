const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide an item title'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: [true, 'Please provide an item description'],
    maxlength: 3000
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  images: {
    type: [String],
    validate: [val => val.length > 0, 'Please provide at least one product image']
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Usable'],
    required: [true, 'Please specify the item condition']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify the available quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  donationType: {
    type: String,
    enum: ['Free', 'Paid'],
    default: 'Free',
    required: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(val) {
        if (this.donationType === 'Paid' && (!val || val <= 0)) {
          return false;
        }
        return true;
      },
      message: 'Please provide a valid price for a paid donation'
    }
  },
  location: {
    street: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String, default: '' }
  },
  contactPreference: {
    type: String,
    enum: ['Platform Chat', 'Phone Call', 'WhatsApp', 'Email'],
    default: 'Platform Chat'
  },
  availabilityDate: {
    type: Date,
    default: Date.now
  },
  additionalInstructions: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Available', 'Request Received', 'Reserved', 'Completed', 'Rejected', 'Unavailable', 'Cancelled'],
    default: 'Available'
  },
  views: {
    type: Number,
    default: 0
  },
  moderationStatus: {
    type: String,
    enum: ['Pending Review', 'Approved', 'Rejected', 'Suspended'],
    default: 'Approved'
  },
  moderationReason: {
    type: String,
    default: ''
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  isReported: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for search and query performance
donationSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });
donationSchema.index({ status: 1, donationType: 1, categoryId: 1, moderationStatus: 1 });

module.exports = mongoose.model('Donation', donationSchema);
