const ContactMessage = require('../models/ContactMessage');

// @desc    Submit a contact / support inquiry
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, subject, message).'
      });
    }

    const contactMsg = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been sent to our community support team.',
      contactMessage: contactMsg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all contact messages
// @route   GET /api/contact/admin
// @access  Private/Admin
const getAllContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update contact message status & add reply note
// @route   PUT /api/contact/admin/:id
// @access  Private/Admin
const updateContactStatus = async (req, res, next) => {
  try {
    const { status, adminReply } = req.body;
    const msg = await ContactMessage.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (status) msg.status = status;
    if (adminReply !== undefined) msg.adminReply = adminReply;

    await msg.save();

    res.json({
      success: true,
      message: 'Support message updated successfully',
      contactMessage: msg
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  updateContactStatus
};
