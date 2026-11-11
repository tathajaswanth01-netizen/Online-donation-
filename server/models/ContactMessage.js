const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide your message'],
    maxlength: 3000
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Resolved', 'Closed'],
    default: 'New'
  },
  adminReply: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
