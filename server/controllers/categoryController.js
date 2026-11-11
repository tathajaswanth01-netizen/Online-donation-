const Category = require('../models/Category');
const Donation = require('../models/Donation');

// @desc    Get all categories with active donation counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Aggregate counts of available donations per category
    const counts = await Donation.aggregate([
      { $match: { status: 'Available' } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    const categoriesWithCount = categories.map(cat => ({
      ...cat.toObject(),
      availableCount: countMap[cat._id.toString()] || 0
    }));

    res.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const availableCount = await Donation.countDocuments({
      categoryId: category._id,
      status: 'Available'
    });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        availableCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category name already exists.' });
    }

    const category = await Category.create({
      name,
      description,
      icon: icon || 'Package',
      image: req.file ? `/uploads/${req.file.filename}` : (image || '')
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (icon) category.icon = icon;
    if (image) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    if (req.file) {
      category.image = `/uploads/${req.file.filename}`;
    }

    await category.save();

    res.json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (soft deactivate)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
