const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a contact phone number'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  accountType: {
    type: String,
    enum: ['donor', 'receiver', 'both'],
    default: 'both'
  },
  roles: {
    type: [String],
    enum: ['donor', 'receiver', 'admin'],
    default: ['donor']
  },
  profileImage: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  verificationStatus: {
    type: String,
    enum: ['unsubmitted', 'pending', 'verified', 'rejected'],
    default: 'unsubmitted'
  },
  verificationDocuments: [{
    docType: { type: String }, // e.g. 'National ID', 'Driving License', 'Utility Bill', 'Organization ID'
    docNumber: { type: String },
    fileUrl: { type: String },
    notes: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    adminNotes: { type: String }
  }],
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active'
  },
  suspensionReason: {
    type: String,
    default: ''
  },
  suspendedAt: Date,
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Encrypt password using bcrypt before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
