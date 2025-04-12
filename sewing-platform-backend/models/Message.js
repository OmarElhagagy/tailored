const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],
    index: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required'],
    index: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'other'],
      default: 'image'
    },
    url: String,
    name: String,
    size: Number
  }],
  systemGenerated: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index for conversation between two users
MessageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });

// Compound index for messages related to an order
MessageSchema.index({ orderId: 1, timestamp: -1 });

// Index for unread messages
MessageSchema.index({ receiverId: 1, read: 1, timestamp: -1 });

// Method to mark message as read
MessageSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get unread messages count for a user
MessageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ receiverId: userId, read: false });
};

// Static method to get conversation between two users
MessageSchema.statics.getConversation = function(userId1, userId2, limit = 50, skip = 0) {
  return this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ]
  })
  .sort({ timestamp: -1 })
  .skip(skip)
  .limit(limit)
  .populate('senderId', 'name businessName role')
  .populate('receiverId', 'name businessName role');
};

module.exports = mongoose.model('Message', MessageSchema);
