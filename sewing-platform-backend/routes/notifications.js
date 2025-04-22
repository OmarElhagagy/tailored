const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route GET /api/notifications
// @desc Get user notifications with pagination and filters
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build the query
    const query = { userId: req.user.id };
    
    // Filter by read status if provided
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    // Filter by notification type if provided
    if (type) {
      query.type = type;
    }
    
    // Execute the query with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalNotifications = await Notification.countDocuments(query);
    
    // Get count of unread notifications
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      notifications,
      pagination: {
        totalNotifications,
        totalPages: Math.ceil(totalNotifications / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: skip + notifications.length < totalNotifications
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/notifications/:id/read
// @desc Mark a notification as read
// @access Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ errors: [{ message: 'Notification not found' }] });
    }
    
    // Check if notification belongs to the authenticated user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Not authorized to access this notification' }] });
    }
    
    // Mark as read if not already
    if (!notification.read) {
      await notification.markAsRead();
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Notification not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/notifications/read-all
// @desc Mark all notifications as read
// @access Private
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      count: result.nModified
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route DELETE /api/notifications/:id
// @desc Delete a notification
// @access Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ errors: [{ message: 'Notification not found' }] });
    }
    
    // Check if notification belongs to the authenticated user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Not authorized to access this notification' }] });
    }
    
    await notification.remove();
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Notification not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/notifications/unread-count
// @desc Get count of unread notifications
// @access Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router;
