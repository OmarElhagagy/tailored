const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: [
      'message', 
      'order_update', 
      'order_rated', 
      'order_shipped', 
      'order_tracking_update', 
      'order_delivered', 
      'payment_received', 
      'payment_failed',
      'wishlist_price_change',
      'low_stock',
      'out_of_stock',
      'inventory_update',
      'inventory_reorder',
      'saved_search_results',
      'sales_milestone',
      'message_unread'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    refPath: 'relatedType'
  },
  relatedType: {
    type: String,
    enum: ['Order', 'Listing', 'Message', 'User', 'BusinessCredential', null],
    default: null
  },
  actionLink: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for efficient retrieval
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Index for finding related notifications
NotificationSchema.index({ relatedId: 1, relatedType: 1 });

// Method to mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

// Static method to mark all notifications as read for a user
NotificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, read: false },
    { read: true }
  );
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, read: false });
};

// Pre-save hook to set default expiry date if not set
NotificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Default to 30 days expiry
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
