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
    enum: ['order', 'message', 'system', 'inventory', 'payment', 'review'],
    required: [true, 'Notification type is required'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Notification content is required'],
    trim: true
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    refPath: 'relatedModel',
    index: true
  },
  relatedModel: {
    type: String,
    enum: ['Order', 'Message', 'User', 'Listing', 'InventoryItem'],
    required: function() {
      return this.relatedId != null;
    }
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  action: {
    type: {
      type: String,
      enum: ['view', 'respond', 'approve', 'reject', 'other']
    },
    url: String
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for unread notifications by user and type
NotificationSchema.index({ userId: 1, read: 1, type: 1, timestamp: -1 });

// Method to mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get unread notifications count for a user
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId: userId, read: false });
};

// Static method to get unread notifications by type
NotificationSchema.statics.getUnreadByType = function(userId, type) {
  return this.find({ userId: userId, type: type, read: false })
    .sort({ timestamp: -1 });
};

// Mark all notifications of a type as read
NotificationSchema.statics.markAllAsRead = function(userId, type = null) {
  const query = { userId: userId, read: false };
  if (type) {
    query.type = type;
  }
  
  return this.updateMany(query, {
    $set: { read: true, readAt: new Date() }
  });
};

// Remove expired notifications
NotificationSchema.statics.removeExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);
