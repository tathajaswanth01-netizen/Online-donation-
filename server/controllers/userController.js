const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');

// @desc    Get user public profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name profileImage accountType verificationStatus address.city address.state createdAt bio'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get counts
    const donationCount = await Donation.countDocuments({
      donorId: user._id,
      status: { $in: ['Available', 'Reserved', 'Completed'] }
    });

    const completedDonationsCount = await Donation.countDocuments({
      donorId: user._id,
      status: 'Completed'
    });

    res.json({
      success: true,
      user,
      stats: {
        donationCount,
        completedDonationsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit verification documents
// @route   POST /api/users/verify
// @access  Private
const submitVerification = async (req, res, next) => {
  try {
    const { docType, docNumber, notes } = req.body;

    if (!docType || !docNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide document type and document number.'
      });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image or scan of your verification document.'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.verificationDocuments.push({
      docType,
      docNumber,
      fileUrl,
      notes: notes || '',
      submittedAt: new Date()
    });

    user.verificationStatus = 'pending';
    await user.save();

    // Create confirmation notification
    await Notification.create({
      userId: user._id,
      title: 'Verification Documents Received',
      message: 'Your verification request has been submitted. Our team will review your documents within 24-48 hours.',
      type: 'verification_updated'
    });

    res.json({
      success: true,
      message: 'Verification documents submitted successfully for administrative review.',
      verificationStatus: user.verificationStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user verification status & submitted docs
// @route   GET /api/users/verification-status
// @access  Private
const getVerificationStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      'verificationStatus verificationDocuments'
    );

    res.json({
      success: true,
      verificationStatus: user.verificationStatus,
      documents: user.verificationDocuments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  submitVerification,
  getVerificationStatus
};
