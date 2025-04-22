const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Review schema for both products/listings and sellers
 */
const ReviewSchema = new Schema({
  // The user who left the review
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The item being reviewed (can be a Listing or User/Seller)
  itemId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  
  // Type of review: 'listing' or 'seller'
  itemType: {
    type: String,
    enum: ['listing', 'seller'],
    required: true
  },
  
  // Order associated with this review (if applicable)
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Text content of the review
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Optional images attached to the review
  images: [{
    url: String,
    thumbnailUrl: String,
    uploadedAt: Date
  }],
  
  // Title/Headline for the review (optional)
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // Specific aspects of the item being reviewed
  aspects: [{
    name: String,        // e.g., 'quality', 'communication', 'value'
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Helpful votes from other users
  helpfulVotes: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Review status
  status: {
    type: String,
    enum: ['pending', 'published', 'rejected', 'reported'],
    default: 'pending'
  },
  
  // Admin moderation
  moderation: {
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    reason: String
  },
  
  // Review verification - confirmed purchase
  verified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

// Compound index to ensure a user can only leave one review per item
ReviewSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

// Text index for searching reviews
ReviewSchema.index({ content: 'text', title: 'text' });

// Pre-save hook to validate aspects
ReviewSchema.pre('save', function(next) {
  // Ensure aspects have valid ratings
  if (this.aspects && this.aspects.length > 0) {
    for (const aspect of this.aspects) {
      if (aspect.rating < 1 || aspect.rating > 5) {
        return next(new Error('Aspect ratings must be between 1 and 5'));
      }
    }
  }
  next();
});

// Static method to calculate average rating for an item
ReviewSchema.statics.calculateAverageRating = async function(itemId, itemType) {
  const result = await this.aggregate([
    { $match: { itemId, itemType, status: 'published' } },
    { $group: {
      _id: null,
      averageRating: { $avg: '$rating' },
      totalCount: { $sum: 1 }
    }}
  ]);
  
  return result.length > 0 
    ? { average: parseFloat(result[0].averageRating.toFixed(1)), count: result[0].totalCount } 
    : { average: 0, count: 0 };
};

// Instance method to mark a review as helpful
ReviewSchema.methods.markHelpful = async function(userId) {
  if (!this.helpfulVotes.users.includes(userId)) {
    this.helpfulVotes.users.push(userId);
    this.helpfulVotes.count += 1;
    await this.save();
  }
  return this;
};

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review; 