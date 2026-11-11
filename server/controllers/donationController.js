const Donation = require('../models/Donation');
const Category = require('../models/Category');
const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const DonationEvent = require('../models/DonationEvent');

// @desc    Create new donation listing
// @route   POST /api/donations
// @access  Private (Donor / Both / Admin)
const createDonation = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      condition,
      quantity,
      donationType,
      price,
      location,
      contactPreference,
      availabilityDate,
      additionalInstructions,
      imageUrls
    } = req.body;

    // Handle images: either uploaded files or passed URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    if (imageUrls) {
      const parsedUrls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
      if (Array.isArray(parsedUrls)) {
        images = [...images, ...parsedUrls];
      }
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one image of the item.'
      });
    }

    let parsedLocation = location;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        parsedLocation = { city: req.user.address?.city || '', state: req.user.address?.state || '', pincode: req.user.address?.pincode || '' };
      }
    }

    const numQty = parseInt(quantity, 10) || 1;
    const numPrice = donationType === 'Paid' ? parseFloat(price) || 0 : 0;

    const donation = await Donation.create({
      donorId: req.user.id,
      title,
      description,
      categoryId,
      images,
      condition,
      quantity: numQty,
      availableQuantity: numQty,
      donationType: donationType || 'Free',
      price: numPrice,
      location: parsedLocation,
      contactPreference: contactPreference || 'Platform Chat',
      availabilityDate: availabilityDate || Date.now(),
      additionalInstructions: additionalInstructions || '',
      status: 'Available',
      moderationStatus: 'Pending Review'
    });

    // Record creation event in audit trail
    try {
      await DonationEvent.create({
        donationId: donation._id,
        actorId: req.user.id,
        actorRole: 'donor',
        eventType: 'DONATION_CREATED',
        title: 'Donation Listing Created',
        description: `New listing submitted for review: "${donation.title}".`
      });
    } catch (e) {
      console.error('Failed to log donation created event:', e);
    }

    res.status(201).json({
      success: true,
      message: 'Donation listing created successfully and submitted for admin review!',
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations with live search, filters, sorting, pagination
// @route   GET /api/donations
// @access  Public
const getDonations = async (req, res, next) => {
  try {
    const {
      search,
      category,
      type,
      condition,
      city,
      pincode,
      status,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Filter by status (default to Available if not explicitly looking for all/history)
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['Available', 'Request Received'] };
    }

    // Only Approved listings appear in public browsing
    if (req.query.moderationStatus) {
      query.moderationStatus = req.query.moderationStatus;
    } else {
      query.moderationStatus = 'Approved';
    }

    // Category filter
    if (category && category !== 'all') {
      query.categoryId = category;
    }

    // Type filter (Free / Paid)
    if (type && type !== 'all') {
      query.donationType = type;
    }

    // Condition filter
    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    // City & PIN code filters
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (pincode) {
      query['location.pincode'] = pincode;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search keyword in title, description, city, or pincode
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.city': searchRegex },
        { 'location.pincode': searchRegex }
      ];
    }

    // Sorting
    let sortQuery = { createdAt: -1 }; // default newest first
    if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (sort === 'price_asc') {
      sortQuery = { price: 1 };
    } else if (sort === 'price_desc') {
      sortQuery = { price: -1 };
    } else if (sort === 'views') {
      sortQuery = { views: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Donation.countDocuments(query);
    const donations = await Donation.find(query)
      .populate('categoryId', 'name icon slug')
      .populate('donorId', 'name profileImage verificationStatus address.city address.state')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: donations.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donation details by ID
// @route   GET /api/donations/:id
// @access  Public
const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('categoryId', 'name description icon slug')
      .populate('donorId', 'name profileImage verificationStatus createdAt address.city address.state');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation listing not found.'
      });
    }

    // Increment view count
    donation.views += 1;
    await donation.save();

    // Fetch similar donations in the same category
    const similarDonations = await Donation.find({
      categoryId: donation.categoryId._id,
      _id: { $ne: donation._id },
      status: 'Available'
    })
      .populate('categoryId', 'name icon')
      .populate('donorId', 'name profileImage verificationStatus')
      .limit(4);

    res.json({
      success: true,
      donation,
      similarDonations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation
// @route   PUT /api/donations/:id
// @access  Private (Owner / Admin)
const updateDonation = async (req, res, next) => {
  try {
    let donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Check ownership
    if (donation.donorId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this donation listing.'
      });
    }

    const {
      title,
      description,
      categoryId,
      condition,
      quantity,
      donationType,
      price,
      location,
      contactPreference,
      additionalInstructions,
      status
    } = req.body;

    if (title) donation.title = title;
    if (description) donation.description = description;
    if (categoryId) donation.categoryId = categoryId;
    if (condition) donation.condition = condition;
    if (contactPreference) donation.contactPreference = contactPreference;
    if (additionalInstructions !== undefined) donation.additionalInstructions = additionalInstructions;
    if (status) donation.status = status;

    if (quantity !== undefined) {
      const newQty = parseInt(quantity, 10);
      const diff = newQty - donation.quantity;
      donation.quantity = newQty;
      donation.availableQuantity = Math.max(0, donation.availableQuantity + diff);
    }

    if (donationType) {
      donation.donationType = donationType;
      donation.price = donationType === 'Paid' ? parseFloat(price) || 0 : 0;
    }

    if (location) {
      let parsedLocation = location;
      if (typeof location === 'string') {
        try {
          parsedLocation = JSON.parse(location);
        } catch (e) {}
      }
      donation.location = { ...donation.location, ...parsedLocation };
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      donation.images = [...donation.images, ...newImages];
    }

    await donation.save();

    res.json({
      success: true,
      message: 'Donation listing updated successfully',
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donation listing
// @route   DELETE /api/donations/:id
// @access  Private (Owner / Admin)
const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Ownership check
    if (donation.donorId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this donation.'
      });
    }

    // Check if there are active accepted requests
    const activeRequests = await DonationRequest.find({
      donationId: donation._id,
      status: { $in: ['Accepted', 'Ready for Pickup', 'Handed Over'] }
    });

    if (activeRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete donation listing with active or accepted requests. Please complete or cancel existing requests first.'
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Donation listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor's own donations
// @route   GET /api/donations/my-donations
// @access  Private
const getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle donation availability
// @route   PATCH /api/donations/:id/availability
// @access  Private
const toggleAvailability = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    donation.status = donation.status === 'Available' ? 'Unavailable' : 'Available';
    await donation.save();

    res.json({
      success: true,
      message: `Donation marked as ${donation.status}`,
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homepage dynamic sections and live impact stats
// @route   GET /api/donations/home-data
// @access  Public
const getHomeData = async (req, res, next) => {
  try {
    // 1. Recently added donations (Approved only)
    const recentDonations = await Donation.find({ status: 'Available', moderationStatus: 'Approved' })
      .populate('categoryId', 'name icon')
      .populate('donorId', 'name profileImage verificationStatus address.city address.state')
      .sort({ createdAt: -1 })
      .limit(6);

    // 2. Available free donations (Approved only)
    const freeDonations = await Donation.find({ status: 'Available', donationType: 'Free', moderationStatus: 'Approved' })
      .populate('categoryId', 'name icon')
      .populate('donorId', 'name profileImage verificationStatus address.city address.state')
      .sort({ createdAt: -1 })
      .limit(6);

    // 3. Available paid donations (Approved only)
    const paidDonations = await Donation.find({ status: 'Available', donationType: 'Paid', moderationStatus: 'Approved' })
      .populate('categoryId', 'name icon')
      .populate('donorId', 'name profileImage verificationStatus address.city address.state')
      .sort({ createdAt: -1 })
      .limit(6);

    // 4. Recently completed donations
    const completedDonations = await Donation.find({ status: 'Completed' })
      .populate('categoryId', 'name icon')
      .populate('donorId', 'name profileImage verificationStatus address.city address.state')
      .sort({ updatedAt: -1 })
      .limit(6);

    // 5. Live community impact statistics
    const totalDonations = await Donation.countDocuments();
    const completedCount = await Donation.countDocuments({ status: 'Completed' });
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const totalCategories = await Category.countDocuments({ isActive: true });

    res.json({
      success: true,
      sections: {
        recentDonations,
        freeDonations,
        paidDonations,
        completedDonations
      },
      stats: {
        totalDonations,
        completedDonations: completedCount,
        totalUsers,
        verifiedUsers,
        totalCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getMyDonations,
  toggleAvailability,
  getHomeData
};
