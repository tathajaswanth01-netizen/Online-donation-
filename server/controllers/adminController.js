const User = require('../models/User');
const Donation = require('../models/Donation');
const DonationRequest = require('../models/DonationRequest');
const Category = require('../models/Category');
const Report = require('../models/Report');
const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');
const DonationEvent = require('../models/DonationEvent');

// @desc    Get comprehensive admin analytics and dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ roles: 'donor' });
    const totalReceivers = await User.countDocuments({ roles: 'receiver' });
    const suspendedUsers = await User.countDocuments({ accountStatus: 'suspended' });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });

    const totalDonations = await Donation.countDocuments();
    const availableDonations = await Donation.countDocuments({ status: 'Available' });
    const completedDonations = await Donation.countDocuments({ status: 'Completed' });
    const reservedDonations = await Donation.countDocuments({ status: 'Reserved' });

    const totalRequests = await DonationRequest.countDocuments();
    const pendingRequests = await DonationRequest.countDocuments({ status: 'Pending' });
    const acceptedRequests = await DonationRequest.countDocuments({ status: 'Accepted' });
    const completedRequests = await DonationRequest.countDocuments({ status: 'Completed' });

    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const newSupportMessages = await ContactMessage.countDocuments({ status: 'New' });

    // Chart Data: Donations by Category
    const categoryStats = await Donation.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          count: 1
        }
      }
    ]);

    // Chart Data: Free vs Paid
    const typeStats = await Donation.aggregate([
      {
        $group: {
          _id: '$donationType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Chart Data: Status breakdown
    const statusStats = await Donation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          donors: totalDonors,
          receivers: totalReceivers,
          suspended: suspendedUsers,
          pendingVerifications
        },
        donations: {
          total: totalDonations,
          available: availableDonations,
          completed: completedDonations,
          reserved: reservedDonations
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          accepted: acceptedRequests,
          completed: completedRequests
        },
        moderation: {
          pendingReports,
          newSupportMessages
        }
      },
      charts: {
        categoryStats,
        typeStats,
        statusStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, filter, pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, verificationStatus, accountStatus, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role && role !== 'all') {
      query.roles = role;
    }
    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }
    if (accountStatus && accountStatus !== 'all') {
      query.accountStatus = accountStatus;
    }

    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'address.city': searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / roles / suspend / reactivate
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { accountStatus, roles, suspensionReason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (accountStatus) {
      user.accountStatus = accountStatus;
      if (accountStatus === 'suspended') {
        user.suspensionReason = suspensionReason || 'Violated community guidelines or terms of service.';
        user.suspendedAt = new Date();
      } else if (accountStatus === 'active') {
        user.suspensionReason = '';
        user.suspendedAt = null;
      }
    }

    if (roles && Array.isArray(roles)) {
      user.roles = roles;
    }

    await user.save();

    // Create system notification for the user
    await Notification.create({
      userId: user._id,
      title: 'Account Status Update',
      message: accountStatus === 'suspended'
        ? `Your account has been suspended. Reason: ${user.suspensionReason}`
        : `Your account status has been set to: ${user.accountStatus}.`,
      type: 'system'
    });

    res.json({
      success: true,
      message: `User status updated to ${user.accountStatus}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review and update verification status
// @route   PUT /api/admin/users/:id/verification
// @access  Private/Admin
const reviewVerification = async (req, res, next) => {
  try {
    const { verificationStatus, adminNotes } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.verificationStatus = verificationStatus;

    if (user.verificationDocuments && user.verificationDocuments.length > 0) {
      const lastDoc = user.verificationDocuments[user.verificationDocuments.length - 1];
      lastDoc.reviewedAt = new Date();
      if (adminNotes !== undefined) lastDoc.adminNotes = adminNotes;
    }

    await user.save();

    // Send notification
    const isApproved = verificationStatus === 'verified';
    const isRejected = verificationStatus === 'rejected';
    await Notification.create({
      userId: user._id,
      title: isApproved ? 'Verification Approved!' : (isRejected ? 'Verification Rejected' : 'Verification Status Updated'),
      message: isApproved
        ? 'Congratulations! Your profile has been verified. A verified badge is now displayed on your profile.'
        : isRejected
        ? `Your verification request was rejected. Reason: ${adminNotes || 'Supporting document did not meet verification criteria.'}`
        : 'Your verification status has been set to pending review.',
      type: 'verification_updated'
    });

    res.json({
      success: true,
      message: `User verification marked as ${verificationStatus}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations for admin moderation
// @route   GET /api/admin/donations
// @access  Private/Admin
const getAllDonationsAdmin = async (req, res, next) => {
  try {
    const { search, status, type, moderationStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.donationType = type;
    if (moderationStatus && moderationStatus !== 'all') query.moderationStatus = moderationStatus;

    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.city': searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Donation.countDocuments(query);
    const donations = await Donation.find(query)
      .populate('categoryId', 'name icon slug')
      .populate('donorId', 'name email phone verificationStatus address.city')
      .populate('moderatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Counts for moderation summary pills
    const pendingCount = await Donation.countDocuments({ moderationStatus: 'Pending Review' });
    const approvedCount = await Donation.countDocuments({ moderationStatus: 'Approved' });
    const rejectedCount = await Donation.countDocuments({ moderationStatus: 'Rejected' });
    const suspendedCount = await Donation.countDocuments({ moderationStatus: 'Suspended' });

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      summary: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        suspended: suspendedCount,
        total: await Donation.countDocuments()
      },
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate a donation listing (Approve / Reject / Suspend)
// @route   PUT /api/admin/donations/:id/moderate
// @access  Private/Admin
const moderateDonation = async (req, res, next) => {
  try {
    const { moderationStatus, reason } = req.body;

    if (!['Approved', 'Rejected', 'Suspended', 'Pending Review'].includes(moderationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid moderation status.' });
    }

    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name email')
      .populate('categoryId', 'name');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    donation.moderationStatus = moderationStatus;
    if (reason !== undefined) {
      donation.moderationReason = reason;
    }
    donation.moderatedBy = req.user.id;
    donation.moderatedAt = new Date();

    await donation.save();

    // Log event in audit trail
    await DonationEvent.create({
      donationId: donation._id,
      actorId: req.user.id,
      actorRole: 'admin',
      eventType: 'DONATION_MODERATED',
      title: `Listing Moderated: ${moderationStatus}`,
      description: reason
        ? `Administrator changed status to ${moderationStatus}. Reason: "${reason}"`
        : `Administrator approved listing for public viewing.`,
      metadata: { moderationStatus, reason }
    });

    // Notify donor
    let notifMsg = `Your donation listing "${donation.title}" has been approved and is now live for people to request!`;
    if (moderationStatus === 'Rejected') {
      notifMsg = `Your donation listing "${donation.title}" was rejected. Reason: ${reason || 'Does not comply with community guidelines.'}`;
    } else if (moderationStatus === 'Suspended') {
      notifMsg = `Your donation listing "${donation.title}" was suspended. Reason: ${reason || 'Under review by administration.'}`;
    }

    await Notification.create({
      userId: donation.donorId._id || donation.donorId,
      title: `Donation Listing: ${moderationStatus}`,
      message: notifMsg,
      type: 'moderation',
      relatedDonationId: donation._id
    });

    res.json({
      success: true,
      message: `Donation listing status updated to ${moderationStatus}.`,
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests for admin monitoring
// @route   GET /api/admin/requests
// @access  Private/Admin
const getAllRequestsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await DonationRequest.countDocuments(query);
    const requests = await DonationRequest.find(query)
      .populate('donationId', 'title donationType price images condition')
      .populate('donorId', 'name email phone verificationStatus address.city')
      .populate('receiverId', 'name email phone verificationStatus address.city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete donation and receiver tracking
// @route   GET /api/admin/tracking
// @access  Private/Admin
const getDonationTracking = async (req, res, next) => {
  try {
    const {
      search,
      status,
      type,
      otpStatus,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    let allMatchingRequests = await DonationRequest.find(query)
      .populate({
        path: 'donationId',
        populate: { path: 'categoryId', select: 'name icon' }
      })
      .populate('donorId', 'name email phone address profileImage verificationStatus')
      .populate('receiverId', 'name email phone address profileImage verificationStatus')
      .sort({ updatedAt: -1 });

    // Filter by search (title, donor name, receiver name, requestId)
    if (search && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      allMatchingRequests = allMatchingRequests.filter(r => {
        const title = r.donationId?.title?.toLowerCase() || '';
        const donorName = r.donorId?.name?.toLowerCase() || '';
        const receiverName = r.receiverId?.name?.toLowerCase() || '';
        const idStr = r._id.toString();
        return title.includes(s) || donorName.includes(s) || receiverName.includes(s) || idStr.includes(s);
      });
    }

    // Filter by type (Free / Paid)
    if (type && type !== 'all') {
      allMatchingRequests = allMatchingRequests.filter(r => r.donationId?.donationType === type);
    }

    // Filter by otpStatus
    if (otpStatus && otpStatus !== 'all') {
      const now = new Date();
      allMatchingRequests = allMatchingRequests.filter(r => {
        if (otpStatus === 'verified') return r.otpVerified === true;
        if (otpStatus === 'active') {
          return !r.otpVerified && ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status) && (!r.otpExpiresAt || now <= new Date(r.otpExpiresAt));
        }
        if (otpStatus === 'expired') {
          return !r.otpVerified && r.otpExpiresAt && now > new Date(r.otpExpiresAt);
        }
        if (otpStatus === 'pending') {
          return !r.otpVerified && ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status);
        }
        return true;
      });
    }

    const total = allMatchingRequests.length;
    const paginated = allMatchingRequests.slice(skip, skip + limitNum);

    // Summary numerical statistics
    const allRequests = await DonationRequest.find().populate('donationId', 'donationType price');
    const totalTracked = allRequests.length;
    const completedCount = allRequests.filter(r => r.status === 'Completed').length;
    const acceptedCount = allRequests.filter(r => ['Accepted', 'Ready for Pickup', 'Handed Over', 'Completed'].includes(r.status)).length;
    const activeHandoverCount = allRequests.filter(r => ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status)).length;
    const successRate = acceptedCount > 0 ? Math.round((completedCount / acceptedCount) * 100) : 100;
    const totalPaidVolume = allRequests
      .filter(r => r.status === 'Completed' && r.agreedPrice > 0)
      .reduce((acc, curr) => acc + (curr.agreedPrice || 0), 0);

    const formatted = paginated.map(r => {
      let otpState = 'Not Required';
      if (['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status)) {
        if (r.otpVerified) {
          otpState = 'Verified';
        } else if (r.otpExpiresAt && new Date() > new Date(r.otpExpiresAt)) {
          otpState = 'Expired';
        } else if (r.otpHash || r.otpEncrypted) {
          otpState = 'Active';
        } else {
          otpState = 'Pending Generation';
        }
      } else if (r.status === 'Completed') {
        otpState = 'Verified';
      }

      return {
        _id: r._id,
        donation: r.donationId ? {
          _id: r.donationId._id,
          title: r.donationId.title,
          images: r.donationId.images,
          condition: r.donationId.condition,
          category: r.donationId.categoryId?.name || 'General',
          donationType: r.donationId.donationType,
          price: r.donationId.price,
          moderationStatus: r.donationId.moderationStatus
        } : null,
        donor: r.donorId ? {
          _id: r.donorId._id,
          name: r.donorId.name,
          email: r.donorId.email,
          phone: r.donorId.phone,
          city: r.donorId.address?.city,
          state: r.donorId.address?.state,
          verificationStatus: r.donorId.verificationStatus
        } : null,
        receiver: r.receiverId ? {
          _id: r.receiverId._id,
          name: r.receiverId.name,
          email: r.receiverId.email,
          phone: r.receiverId.phone,
          city: r.receiverId.address?.city,
          state: r.receiverId.address?.state,
          verificationStatus: r.receiverId.verificationStatus
        } : null,
        requestedQuantity: r.requestedQuantity,
        agreedPrice: r.agreedPrice,
        paymentStatus: r.paymentStatus,
        preferredPickupMethod: r.preferredPickupMethod,
        reason: r.reason,
        intendedUse: r.intendedUse,
        message: r.message,
        requestDate: r.createdAt,
        acceptedDate: r.acceptedAt || (r.status === 'Accepted' || r.status === 'Completed' ? r.updatedAt : null),
        handoverDate: r.readyForPickupAt || r.handoverDate,
        completedDate: r.completedAt || r.completedDate,
        status: r.status,
        otpStatus: otpState,
        otpVerifiedAt: r.otpVerifiedAt,
        otpAttempts: r.otpAttempts
      };
    });

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      analytics: {
        totalTracked,
        completedCount,
        activeHandoverCount,
        successRate,
        totalPaidVolume
      },
      trackingRecords: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed audit timeline and events for a donation request
// @route   GET /api/admin/tracking/:id
// @access  Private/Admin
const getDonationTrackingDetails = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate({
        path: 'donationId',
        populate: [
          { path: 'categoryId', select: 'name icon' },
          { path: 'donorId', select: 'name email phone address verificationStatus' }
        ]
      })
      .populate('donorId', 'name email phone address verificationStatus profileImage')
      .populate('receiverId', 'name email phone address verificationStatus profileImage');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request record not found' });
    }

    const events = await DonationEvent.find({
      $or: [
        { requestId: request._id },
        { donationId: request.donationId?._id }
      ]
    })
      .populate('actorId', 'name email roles')
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      request,
      timeline: events
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  reviewVerification,
  getAllDonationsAdmin,
  moderateDonation,
  getAllRequestsAdmin,
  getDonationTracking,
  getDonationTrackingDetails
};
