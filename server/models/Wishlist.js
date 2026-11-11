const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  donations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
