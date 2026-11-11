const DonationRequest = require('../models/DonationRequest');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const DonationEvent = require('../models/DonationEvent');
const {
  generate6DigitOTP,
  hashOTP,
  verifyOTPHash,
  encryptOTP,
  decryptOTP
} = require('../utils/otpHelper');

// Helper to log donation timeline event
const logDonationEvent = async ({
  donationId,
  requestId,
  actorId,
  actorRole,
  eventType,
  title,
  description,
  metadata
}) => {
  try {
    await DonationEvent.create({
      donationId,
      requestId: requestId || null,
      actorId: actorId || null,
      actorRole: actorRole || 'system',
      eventType,
      title,
      description: description || '',
      metadata: metadata || {}
    });
  } catch (err) {
    console.error('Failed to log donation event:', err);
  }
};

// @desc    Submit a donation request
// @route   POST /api/requests
// @access  Private (Receiver / Both / Admin)
const createRequest = async (req, res, next) => {
  try {
    const {
      donationId,
      requestedQuantity,
      reason,
      intendedUse,
      message,
      preferredPickupMethod,
      contactPreference
    } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation listing not found.' });
    }

    // Donor cannot request their own donation
    if (donation.donorId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own donation listing.'
      });
    }

    if (donation.status !== 'Available' && donation.status !== 'Request Received') {
      return res.status(400).json({
        success: false,
        message: 'This item is currently not available for requests.'
      });
    }

    const qty = parseInt(requestedQuantity, 10) || 1;
    if (qty > donation.availableQuantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${qty}) exceeds available quantity (${donation.availableQuantity}).`
      });
    }

    // Check for existing active request by same user
    const existing = await DonationRequest.findOne({
      donationId,
      receiverId: req.user.id,
      status: { $in: ['Pending', 'Accepted', 'Ready for Pickup', 'Handed Over'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active request for this donation.'
      });
    }

    const agreedPrice = donation.donationType === 'Paid' ? (donation.price * qty) : 0;
    const paymentStatus = donation.donationType === 'Paid' ? 'Pending' : 'N/A';

    const donationRequest = await DonationRequest.create({
      donationId,
      donorId: donation.donorId,
      receiverId: req.user.id,
      requestedQuantity: qty,
      reason,
      intendedUse,
      message: message || '',
      preferredPickupMethod: preferredPickupMethod || 'Self Pickup',
      contactPreference: contactPreference || 'Platform Chat',
      agreedPrice,
      paymentStatus,
      status: 'Pending'
    });

    // Update donation status to indicate interest
    if (donation.status === 'Available') {
      donation.status = 'Request Received';
      await donation.save();
    }

    // Log timeline event
    await logDonationEvent({
      donationId: donation._id,
      requestId: donationRequest._id,
      actorId: req.user.id,
      actorRole: 'receiver',
      eventType: 'REQUEST_SUBMITTED',
      title: 'Receiver Requested Item',
      description: `${req.user.name} submitted a request for ${qty} unit(s). Reason: "${reason.substring(0, 100)}..."`,
      metadata: { requestedQuantity: qty, agreedPrice }
    });

    // Notify donor
    await Notification.create({
      userId: donation.donorId,
      title: 'New Donation Request Received',
      message: `${req.user.name} has requested "${donation.title}" (Qty: ${qty}).`,
      type: 'request_received',
      relatedDonationId: donation._id,
      relatedRequestId: donationRequest._id
    });

    res.status(201).json({
      success: true,
      message: 'Donation request submitted successfully!',
      donationRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requests submitted by receiver
// @route   GET /api/requests/my-requests
// @access  Private
const getReceiverRequests = async (req, res, next) => {
  try {
    const requests = await DonationRequest.find({ receiverId: req.user.id })
      .populate({
        path: 'donationId',
        populate: { path: 'categoryId', select: 'name icon' }
      })
      .populate('donorId', 'name phone email profileImage verificationStatus address.city address.state')
      .sort({ createdAt: -1 });

    const formatted = [];
    const now = new Date();

    for (let r of requests) {
      const obj = r.toObject();

      // If request is in handover status, ensure OTP is available to the authorized receiver
      if (['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status)) {
        if (!r.otpEncrypted || !r.otpExpiresAt) {
          const plainOtp = generate6DigitOTP();
          r.otpHash = hashOTP(plainOtp);
          r.otpEncrypted = encryptOTP(plainOtp);
          r.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
          r.lastOtpGeneratedAt = new Date();
          r.otpAttempts = 0;
          r.otpVerified = false;
          await r.save();
          obj.otpEncrypted = r.otpEncrypted;
          obj.otpExpiresAt = r.otpExpiresAt;
        }

        const isExpired = obj.otpExpiresAt ? now > new Date(obj.otpExpiresAt) : true;
        const remainingSeconds = obj.otpExpiresAt
          ? Math.max(0, Math.floor((new Date(obj.otpExpiresAt).getTime() - now.getTime()) / 1000))
          : 0;

        if (obj.otpEncrypted && !isExpired && !obj.otpVerified) {
          obj.otp = decryptOTP(obj.otpEncrypted);
        } else {
          obj.otp = null;
        }

        obj.isExpired = isExpired;
        obj.remainingSeconds = remainingSeconds;
      } else {
        obj.otp = null;
        obj.isExpired = false;
        obj.remainingSeconds = 0;
      }

      delete obj.otpHash;
      delete obj.otpEncrypted;
      formatted.push(obj);
    }

    res.json({
      success: true,
      requests: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming requests for donor
// @route   GET /api/requests/incoming
// @access  Private
const getDonorIncomingRequests = async (req, res, next) => {
  try {
    const requests = await DonationRequest.find({ donorId: req.user.id })
      .populate({
        path: 'donationId',
        populate: { path: 'categoryId', select: 'name icon' }
      })
      .populate('receiverId', 'name phone email profileImage verificationStatus address.city address.state createdAt bio')
      .sort({ createdAt: -1 });

    const formatted = requests.map(r => {
      const obj = r.toObject();
      // SECURITY: Donor must NEVER see the OTP or encrypted ciphertext or hash!
      delete obj.otp;
      delete obj.otpEncrypted;
      delete obj.otpHash;
      return obj;
    });

    res.json({
      success: true,
      requests: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request details with conversation context
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate('donationId')
      .populate('donorId', 'name email phone profileImage verificationStatus address')
      .populate('receiverId', 'name email phone profileImage verificationStatus address');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Access check: must be donor, receiver, or admin
    const userId = req.user.id;
    if (
      request.donorId._id.toString() !== userId &&
      request.receiverId._id.toString() !== userId &&
      !req.user.roles.includes('admin')
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this request' });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (Accept, Reject, Ready for Pickup, Handed Over)
// @route   PUT /api/requests/:id/status
// @access  Private (Donor / Admin)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, donorNotes, paymentStatus } = req.body;
    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Authorization: only donor or admin
    if (request.donorId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only the item donor or administrator can update this request status.'
      });
    }

    // Do NOT permit marking directly as 'Completed' from simple button click
    if (status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Donation completion requires successful 6-digit OTP verification from the receiver. Please use the Verify Handover action.'
      });
    }

    const donation = await Donation.findById(request.donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Associated donation listing not found.' });
    }

    const prevStatus = request.status;

    // 1. Handle Accepting request
    if (status === 'Accepted' && prevStatus !== 'Accepted') {
      if (donation.availableQuantity < request.requestedQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient quantity available to fulfill this request.'
        });
      }

      donation.availableQuantity -= request.requestedQuantity;
      if (donation.availableQuantity === 0) {
        donation.status = 'Reserved';
      }
      await donation.save();

      request.status = 'Accepted';
      request.acceptedAt = new Date();
      if (donorNotes) request.donorNotes = donorNotes;

      // Automatically generate initial completion OTP for receiver
      const plainOtp = generate6DigitOTP();
      request.otpHash = hashOTP(plainOtp);
      request.otpEncrypted = encryptOTP(plainOtp);
      request.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      request.lastOtpGeneratedAt = new Date();
      request.otpAttempts = 0;
      request.otpVerified = false;

      // Log events
      await logDonationEvent({
        donationId: donation._id,
        requestId: request._id,
        actorId: req.user.id,
        actorRole: 'donor',
        eventType: 'REQUEST_ACCEPTED',
        title: 'Donor Accepted Request',
        description: `Donor accepted the request. Notes: "${donorNotes || 'None'}"`,
        metadata: { donorNotes }
      });

      await logDonationEvent({
        donationId: donation._id,
        requestId: request._id,
        actorId: null,
        actorRole: 'system',
        eventType: 'OTP_GENERATED',
        title: 'Completion Verification OTP Generated',
        description: 'Secure 6-digit OTP generated for the receiver dashboard with a 10-minute validity window.'
      });

      // Notify receiver
      await Notification.create({
        userId: request.receiverId,
        title: 'Donation Request Accepted!',
        message: `Your request for "${donation.title}" has been accepted. Your 6-digit completion verification OTP is now available in your dashboard.`,
        type: 'request_accepted',
        relatedDonationId: donation._id,
        relatedRequestId: request._id
      });
    }
    // 2. Handle Rejecting request
    else if (status === 'Rejected') {
      // If it was previously accepted, return quantity
      if (['Accepted', 'Ready for Pickup', 'Handed Over'].includes(prevStatus)) {
        donation.availableQuantity += request.requestedQuantity;
        if (donation.status === 'Reserved' && donation.availableQuantity > 0) {
          donation.status = 'Available';
        }
        await donation.save();
      }

      request.status = 'Rejected';
      request.rejectedAt = new Date();
      request.rejectionReason = rejectionReason || 'The donor was unable to fulfill this request at this time.';

      // Invalidate OTP
      request.otpHash = null;
      request.otpEncrypted = null;

      await logDonationEvent({
        donationId: donation._id,
        requestId: request._id,
        actorId: req.user.id,
        actorRole: 'donor',
        eventType: 'REQUEST_REJECTED',
        title: 'Donor Declined Request',
        description: `Request was declined. Reason: "${request.rejectionReason}"`
      });

      // Notify receiver
      await Notification.create({
        userId: request.receiverId,
        title: 'Donation Request Update',
        message: `Your request for "${donation.title}" could not be accepted. Reason: ${request.rejectionReason}`,
        type: 'request_rejected',
        relatedDonationId: donation._id,
        relatedRequestId: request._id
      });
    }
    // 3. Handle Ready for Pickup / Ready for Handover
    else if (status === 'Ready for Pickup') {
      request.status = 'Ready for Pickup';
      request.readyForPickupAt = new Date();
      if (donorNotes) request.donorNotes = donorNotes;

      // Ensure fresh OTP is ready for the receiver
      if (!request.otpHash || !request.otpExpiresAt || request.otpExpiresAt < new Date()) {
        const plainOtp = generate6DigitOTP();
        request.otpHash = hashOTP(plainOtp);
        request.otpEncrypted = encryptOTP(plainOtp);
        request.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        request.lastOtpGeneratedAt = new Date();
        request.otpAttempts = 0;
        request.otpVerified = false;

        await logDonationEvent({
          donationId: donation._id,
          requestId: request._id,
          actorId: null,
          actorRole: 'system',
          eventType: 'OTP_GENERATED',
          title: 'Completion Verification OTP Generated',
          description: 'Secure 6-digit OTP refreshed for handover.'
        });
      }

      await logDonationEvent({
        donationId: donation._id,
        requestId: request._id,
        actorId: req.user.id,
        actorRole: 'donor',
        eventType: 'READY_FOR_PICKUP',
        title: 'Item Ready for Handover',
        description: `Donor marked item as ready for pickup. Notes: "${donorNotes || 'None'}"`
      });

      await Notification.create({
        userId: request.receiverId,
        title: 'Item Ready for Handover',
        message: `"${donation.title}" is ready for handover! Please share your 6-digit verification OTP from your dashboard when collecting the item.`,
        type: 'ready_for_pickup',
        relatedDonationId: donation._id,
        relatedRequestId: request._id
      });
    }
    // 4. Handle Handed Over
    else if (status === 'Handed Over') {
      request.status = 'Handed Over';
      request.handoverDate = new Date();
      if (donorNotes) request.donorNotes = donorNotes;

      await logDonationEvent({
        donationId: donation._id,
        requestId: request._id,
        actorId: req.user.id,
        actorRole: 'donor',
        eventType: 'ITEM_HANDED_OVER',
        title: 'Handover in Progress',
        description: 'Donor marked item as handed over. Awaiting OTP verification.'
      });

      await Notification.create({
        userId: request.receiverId,
        title: 'Handover in Progress',
        message: `Donor has initiated handover for "${donation.title}". Please provide your 6-digit verification OTP to finalize.`,
        type: 'handed_over',
        relatedDonationId: donation._id,
        relatedRequestId: request._id
      });
    }

    if (paymentStatus) {
      request.paymentStatus = paymentStatus;
    }

    await request.save();

    res.json({
      success: true,
      message: `Request status updated to ${request.status}`,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active completion OTP for receiver
// @route   GET /api/requests/:id/otp
// @access  Private (Receiver only)
const getReceiverOTP = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate('donationId', 'title images condition')
      .populate('donorId', 'name profileImage phone');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Security check: ONLY authorized receiver can view the OTP
    if (request.receiverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only the designated receiver can view the completion verification OTP.'
      });
    }

    if (!['Accepted', 'Ready for Pickup', 'Handed Over'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `OTP is only available when request is Accepted, Ready for Pickup, or Handed Over (Current status: ${request.status}).`
      });
    }

    // If OTP doesn't exist yet, generate one
    if (!request.otpEncrypted || !request.otpExpiresAt) {
      const plainOtp = generate6DigitOTP();
      request.otpHash = hashOTP(plainOtp);
      request.otpEncrypted = encryptOTP(plainOtp);
      request.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      request.lastOtpGeneratedAt = new Date();
      request.otpAttempts = 0;
      request.otpVerified = false;
      await request.save();
    }

    const plainOtp = decryptOTP(request.otpEncrypted);
    const now = new Date();
    const isExpired = request.otpExpiresAt ? now > new Date(request.otpExpiresAt) : true;
    const remainingSeconds = request.otpExpiresAt
      ? Math.max(0, Math.floor((new Date(request.otpExpiresAt).getTime() - now.getTime()) / 1000))
      : 0;

    res.json({
      success: true,
      requestId: request._id,
      donationTitle: request.donationId?.title,
      donorName: request.donorId?.name,
      status: request.status,
      otp: isExpired ? null : plainOtp,
      isExpired,
      expiresAt: request.otpExpiresAt,
      remainingSeconds,
      otpVerified: request.otpVerified,
      otpAttempts: request.otpAttempts,
      maxAttempts: 5
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate completion OTP (with 30-sec cooldown)
// @route   POST /api/requests/:id/regenerate-otp
// @access  Private (Receiver only)
const regenerateOTP = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate('donationId', 'title')
      .populate('donorId', 'name');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.receiverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only the designated receiver can regenerate the verification OTP.'
      });
    }

    if (!['Accepted', 'Ready for Pickup', 'Handed Over'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot regenerate OTP for a request that is not currently in handover status.'
      });
    }

    // Cooldown check (30 seconds)
    if (request.lastOtpGeneratedAt) {
      const elapsedMs = Date.now() - new Date(request.lastOtpGeneratedAt).getTime();
      if (elapsedMs < 30 * 1000) {
        const waitSec = Math.ceil((30 * 1000 - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSec} second(s) before requesting another OTP.`
        });
      }
    }

    // Invalidate previous OTP and generate new 6-digit OTP
    const plainOtp = generate6DigitOTP();
    request.otpHash = hashOTP(plainOtp);
    request.otpEncrypted = encryptOTP(plainOtp);
    request.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    request.lastOtpGeneratedAt = new Date();
    request.otpAttempts = 0;
    request.otpVerified = false;
    await request.save();

    await logDonationEvent({
      donationId: request.donationId?._id || request.donationId,
      requestId: request._id,
      actorId: req.user.id,
      actorRole: 'receiver',
      eventType: 'OTP_GENERATED',
      title: 'Verification OTP Regenerated',
      description: 'Receiver generated a fresh 6-digit OTP. Previous OTP was invalidated.'
    });

    res.json({
      success: true,
      message: 'New 6-digit OTP generated successfully. Valid for 10 minutes.',
      otp: plainOtp,
      expiresAt: request.otpExpiresAt,
      remainingSeconds: 600
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Step 1 of Handover: Verify completion OTP (Submitted by Donor)
// @route   POST /api/requests/:id/verify-otp
// @access  Private (Donor only)
const verifyCompletionOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp || otp.toString().trim().length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit OTP provided by the receiver.'
      });
    }

    const request = await DonationRequest.findById(req.params.id)
      .populate('donationId')
      .populate('receiverId', 'name email phone');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Ownership check: Authenticated user MUST be the donor of this item
    if (request.donorId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only the donor of this item can verify the handover OTP.'
      });
    }

    if (request.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This donation handover has already been completed.'
      });
    }

    if (!['Accepted', 'Ready for Pickup', 'Handed Over'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Request must be in accepted/handover status to verify OTP (Current status: ${request.status}).`
      });
    }

    // If already verified, inform donor they can click Complete Donation
    if (request.otpVerified) {
      return res.json({
        success: true,
        message: 'OTP has already been verified successfully.',
        otpVerified: true,
        request
      });
    }

    // Check expiration
    if (!request.otpExpiresAt || new Date() > new Date(request.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. The receiver must generate a new OTP.'
      });
    }

    // Check maximum attempts (5)
    if (request.otpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Maximum incorrect attempts exceeded. The receiver must generate a new OTP.'
      });
    }

    // Timing-safe OTP hash comparison
    const isValid = verifyOTPHash(otp.toString().trim(), request.otpHash);

    if (!isValid) {
      request.otpAttempts += 1;
      await request.save();
      const remainingAttempts = 5 - request.otpAttempts;
      return res.status(400).json({
        success: false,
        message: remainingAttempts > 0
          ? `Invalid OTP. Please check the code shared by the receiver (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining).`
          : 'Invalid OTP. Maximum attempts exceeded. The receiver must generate a new OTP.'
      });
    }

    // SUCCESS: Mark OTP as Verified (DO NOT complete the donation yet)
    request.otpVerified = true;
    request.otpVerifiedAt = new Date();
    request.otpAttempts = 0;
    await request.save();

    // Log OTP_VERIFIED event
    await logDonationEvent({
      donationId: request.donationId?._id || request.donationId,
      requestId: request._id,
      actorId: req.user.id,
      actorRole: 'donor',
      eventType: 'OTP_VERIFIED',
      title: 'Handover OTP Verified Successfully',
      description: `Donor verified the 6-digit receiver code. Awaiting final donation completion.`
    });

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      otpVerified: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Step 2 of Handover: Complete donation (Finalized by Donor after OTP verification)
// @route   POST /api/requests/:id/complete
// @access  Private (Donor only)
const completeDonation = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate('donationId')
      .populate('receiverId', 'name email phone');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Authorization: only the item donor or admin
    if (request.donorId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only the donor of this item can finalize completion.'
      });
    }

    if (request.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This donation has already been marked as Completed.'
      });
    }

    if (!['Accepted', 'Ready for Pickup', 'Handed Over'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Request must be in accepted/handover status to complete (Current status: ${request.status}).`
      });
    }

    // STRICT CHECK IN MONGODB: otpVerified MUST BE TRUE!
    if (!request.otpVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete donation: The receiver 6-digit OTP must be verified first.'
      });
    }

    // Finalize completion
    request.status = 'Completed';
    request.completedAt = new Date();
    request.completedDate = new Date();
    // Invalidate OTP on completion
    request.otpHash = null;
    request.otpEncrypted = null;

    const donation = await Donation.findById(request.donationId);
    if (donation) {
      if (donation.availableQuantity === 0) {
        donation.status = 'Completed';
      }
      await donation.save();

      // Handle paid transaction record if applicable
      if (donation.donationType === 'Paid' && request.agreedPrice > 0) {
        request.paymentStatus = 'Paid';
        await Transaction.create({
          requestId: request._id,
          donationId: donation._id,
          donorId: request.donorId,
          receiverId: request.receiverId._id,
          amount: request.agreedPrice,
          paymentMethod: 'Cash on Pickup',
          paymentStatus: 'Completed'
        });
      }
    }

    await request.save();

    // Log completion event in audit trail
    await logDonationEvent({
      donationId: donation ? donation._id : request.donationId,
      requestId: request._id,
      actorId: req.user.id,
      actorRole: 'donor',
      eventType: 'DONATION_COMPLETED',
      title: 'Donation Officially Completed',
      description: `Donation transfer for "${donation ? donation.title : 'item'}" finalized after OTP verification.`
    });

    // Notify receiver
    await Notification.create({
      userId: request.receiverId._id,
      title: 'Donation Completed!',
      message: `Your donation transfer for "${donation ? donation.title : 'the item'}" has been finalized and completed. Thank you!`,
      type: 'donation_completed',
      relatedDonationId: donation ? donation._id : null,
      relatedRequestId: request._id
    });

    // Notify donor
    await Notification.create({
      userId: request.donorId,
      title: 'Donation Completed!',
      message: `"${donation ? donation.title : 'The item'}" has been marked as Completed. Thank you for your donation!`,
      type: 'donation_completed',
      relatedDonationId: donation ? donation._id : null,
      relatedRequestId: request._id
    });

    res.json({
      success: true,
      message: 'Donation officially completed successfully!',
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active handover verification items for receiver dashboard
// @route   GET /api/requests/completion-verification
// @access  Private (Receiver)
const getReceiverVerificationRequests = async (req, res, next) => {
  try {
    const requests = await DonationRequest.find({
      receiverId: req.user.id,
      status: { $in: ['Accepted', 'Ready for Pickup', 'Handed Over', 'Completed'] }
    })
      .populate('donationId', 'title images condition donationType price location')
      .populate('donorId', 'name profileImage phone verificationStatus address.city')
      .sort({ updatedAt: -1 });

    const formatted = requests.map((r) => {
      let plainOtp = null;
      const now = new Date();
      const isExpired = r.otpExpiresAt ? now > new Date(r.otpExpiresAt) : true;
      const remainingSeconds = r.otpExpiresAt
        ? Math.max(0, Math.floor((new Date(r.otpExpiresAt).getTime() - now.getTime()) / 1000))
        : 0;

      if (r.otpEncrypted && !isExpired && !r.otpVerified) {
        plainOtp = decryptOTP(r.otpEncrypted);
      }

      return {
        _id: r._id,
        donationId: r.donationId,
        donorId: r.donorId,
        requestedQuantity: r.requestedQuantity,
        agreedPrice: r.agreedPrice,
        status: r.status,
        acceptedAt: r.acceptedAt || r.updatedAt,
        readyForPickupAt: r.readyForPickupAt,
        otp: plainOtp,
        isExpired,
        expiresAt: r.otpExpiresAt,
        remainingSeconds,
        otpVerified: r.otpVerified,
        otpVerifiedAt: r.otpVerifiedAt,
        otpAttempts: r.otpAttempts,
        completedAt: r.completedAt || r.completedDate
      };
    });

    res.json({
      success: true,
      items: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel request (by Receiver)
// @route   PUT /api/requests/:id/cancel
// @access  Private (Receiver)
const cancelRequest = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.receiverId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only the requesting user can cancel this request.'
      });
    }

    if (['Completed', 'Cancelled'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${request.status.toLowerCase()}.`
      });
    }

    const donation = await Donation.findById(request.donationId);

    // If request was already accepted, restore quantity
    if (['Accepted', 'Ready for Pickup', 'Handed Over'].includes(request.status)) {
      if (donation) {
        donation.availableQuantity += request.requestedQuantity;
        if (donation.status === 'Reserved' && donation.availableQuantity > 0) {
          donation.status = 'Available';
        }
        await donation.save();
      }
    }

    request.status = 'Cancelled';
    request.cancelledAt = new Date();
    // Invalidate OTP
    request.otpHash = null;
    request.otpEncrypted = null;
    await request.save();

    await logDonationEvent({
      donationId: request.donationId,
      requestId: request._id,
      actorId: req.user.id,
      actorRole: 'receiver',
      eventType: 'REQUEST_CANCELLED',
      title: 'Receiver Cancelled Request',
      description: `${req.user.name} cancelled their request.`
    });

    // Notify donor
    if (donation) {
      await Notification.create({
        userId: request.donorId,
        title: 'Request Cancelled',
        message: `${req.user.name} cancelled their request for "${donation.title}".`,
        type: 'request_cancelled',
        relatedDonationId: donation._id,
        relatedRequestId: request._id
      });
    }

    res.json({
      success: true,
      message: 'Request cancelled successfully',
      request
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getReceiverRequests,
  getDonorIncomingRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
  getReceiverOTP,
  regenerateOTP,
  verifyCompletionOTP,
  completeDonation,
  getReceiverVerificationRequests
};
