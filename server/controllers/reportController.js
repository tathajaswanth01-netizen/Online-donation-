const Report = require('../models/Report');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Submit report regarding a donation listing or user
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { donationId, reportedUserId, reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the reason and detailed description for this report.'
      });
    }

    let finalReportedUserId = reportedUserId;

    if (donationId) {
      const donation = await Donation.findById(donationId);
      if (donation) {
        donation.isReported = true;
        await donation.save();
        if (!finalReportedUserId) {
          finalReportedUserId = donation.donorId;
        }
      }
    }

    const report = await Report.create({
      reporterId: req.user.id,
      reportedUserId: finalReportedUserId,
      donationId: donationId || null,
      reason,
      description,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our trust and safety team will review it promptly.',
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's submitted reports
// @route   GET /api/reports/my-reports
// @access  Private
const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporterId: req.user.id })
      .populate('donationId', 'title images')
      .populate('reportedUserId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all reports
// @route   GET /api/reports/admin
// @access  Private/Admin
const getAllReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reporterId', 'name email phone')
      .populate('reportedUserId', 'name email accountStatus verificationStatus')
      .populate('donationId', 'title status donationType price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update report status and moderation action
// @route   PUT /api/reports/admin/:id
// @access  Private/Admin
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminAction, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status) report.status = status;
    if (adminAction) report.adminAction = adminAction;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();

    // Take concrete moderation action
    if (adminAction === 'Listing Removed' && report.donationId) {
      await Donation.findByIdAndUpdate(report.donationId, {
        status: 'Unavailable',
        isFlagged: true
      });
    }

    if (adminAction === 'User Suspended' && report.reportedUserId) {
      await User.findByIdAndUpdate(report.reportedUserId, {
        accountStatus: 'suspended'
      });
    }

    await report.save();

    // Notify the reporter that action was taken
    await Notification.create({
      userId: report.reporterId,
      title: 'Report Update',
      message: `Your report concerning "${report.reason}" has been reviewed and marked as ${report.status}. Action: ${report.adminAction}. Thank you for keeping our community safe.`,
      type: 'report_resolved'
    });

    res.json({
      success: true,
      message: 'Report resolved and moderation action applied successfully',
      report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus
};
