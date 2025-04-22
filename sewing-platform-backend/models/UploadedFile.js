const mongoose = require('mongoose');
const { Schema } = mongoose;

const UploadedFileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  storedFileName: {
    type: String,
    required: true,
    unique: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  fileType: {
    type: String,
    required: true,
    index: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  contentType: {
    type: String,
    enum: ['profile_image', 'listing_image', 'product_image', 'message_attachment', 'order_photo', 'return_evidence', 'dispute_evidence', 'custom_requirements'],
    required: true,
    index: true
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    refPath: 'relatedModel',
    index: true
  },
  relatedModel: {
    type: String,
    enum: ['User', 'Listing', 'Order', 'Message'],
  },
  tags: [String],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String
}, {
  timestamps: true
});

// Index for searching by content type and related entity
UploadedFileSchema.index({ contentType: 1, relatedId: 1 });

// Index for searching by file type
UploadedFileSchema.index({ fileType: 1 });

// Method to generate thumbnail URL for image files
UploadedFileSchema.methods.generateThumbnailUrl = function() {
  if (!this.fileUrl || !this.isImage()) {
    return null;
  }
  
  // Simple implementation - in production this would call a resizing service
  // For now we'll just append a query parameter to the original URL
  return `${this.fileUrl}?width=200&height=200&fit=crop`;
};

// Check if file is an image
UploadedFileSchema.methods.isImage = function() {
  return this.fileType.startsWith('image/');
};

// Static method to get files for a specific entity
UploadedFileSchema.statics.getFilesForEntity = function(modelName, entityId, contentType = null) {
  const query = {
    relatedModel: modelName,
    relatedId: entityId
  };
  
  if (contentType) {
    query.contentType = contentType;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get public listing images
UploadedFileSchema.statics.getListingImages = function(listingId) {
  return this.find({
    relatedModel: 'Listing',
    relatedId: listingId,
    contentType: 'listing_image',
    isPublic: true
  }).sort({ createdAt: -1 });
};

// Pre-save hook to ensure thumbnail URLs exist for images
UploadedFileSchema.pre('save', function(next) {
  if (this.isImage() && !this.thumbnailUrl) {
    this.thumbnailUrl = this.generateThumbnailUrl();
  }
  next();
});

module.exports = mongoose.model('UploadedFile', UploadedFileSchema); 