const Wishlist = require('../models/Wishlist');
const Donation = require('../models/Donation');

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id })
      .populate({
        path: 'donations',
        populate: [
          { path: 'categoryId', select: 'name icon' },
          { path: 'donorId', select: 'name verificationStatus profileImage address.city' }
        ]
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, donations: [] });
    }

    res.json({
      success: true,
      wishlist: wishlist.donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { donationId } = req.body;

    if (!donationId) {
      return res.status(400).json({ success: false, message: 'Donation ID is required' });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, donations: [] });
    }

    const index = wishlist.donations.findIndex(id => id.toString() === donationId);
    let isSaved = false;

    if (index > -1) {
      // Remove
      wishlist.donations.splice(index, 1);
      isSaved = false;
    } else {
      // Add
      wishlist.donations.push(donationId);
      isSaved = true;
    }

    await wishlist.save();

    res.json({
      success: true,
      message: isSaved ? 'Item added to saved donations' : 'Item removed from saved donations',
      isSaved,
      savedIds: wishlist.donations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist
};
