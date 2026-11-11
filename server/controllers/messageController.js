const Message = require('../models/Message');
const DonationRequest = require('../models/DonationRequest');
const Notification = require('../models/Notification');

// @desc    Send message within an accepted request
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { requestId, message } = req.body;

    if (!requestId || !message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Request ID and message content are required' });
    }

    const request = await DonationRequest.findById(requestId)
      .populate('donationId', 'title');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Communication allowed only if user is donor or receiver
    const isDonor = request.donorId.toString() === req.user.id;
    const isReceiver = request.receiverId.toString() === req.user.id;

    if (!isDonor && !isReceiver && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Unauthorized to participate in this conversation' });
    }

    const recipientId = isDonor ? request.receiverId : request.donorId;

    const newMsg = await Message.create({
      requestId,
      senderId: req.user.id,
      receiverId: recipientId,
      message: message.trim()
    });

    const populatedMsg = await Message.findById(newMsg._id)
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage');

    // Notify recipient if needed
    await Notification.create({
      userId: recipientId,
      title: 'New Message',
      message: `${req.user.name}: "${message.length > 50 ? message.substring(0, 47) + '...' : message}"`,
      type: 'new_message',
      relatedRequestId: requestId,
      relatedDonationId: request.donationId?._id
    });

    // If socket.io is attached to global or req.app
    const io = req.app.get('io');
    if (io) {
      io.to(requestId.toString()).emit('receive_message', populatedMsg);
      io.to(recipientId.toString()).emit('new_notification', {
        title: 'New Message',
        message: `${req.user.name}: "${message.substring(0, 40)}..."`
      });
    }

    res.status(201).json({
      success: true,
      message: populatedMsg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages for a specific request conversation
// @route   GET /api/messages/request/:requestId
// @access  Private
const getMessagesByRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = await DonationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isDonor = request.donorId.toString() === req.user.id;
    const isReceiver = request.receiverId.toString() === req.user.id;

    if (!isDonor && !isReceiver && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this conversation' });
    }

    const messages = await Message.find({ requestId })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: 1 });

    // Mark messages where current user is receiver as read
    await Message.updateMany(
      { requestId, receiverId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessagesByRequest
};
