const mongoose = require('mongoose');
const { Schema } = mongoose;

const LegalDocumentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['terms_of_service', 'privacy_policy', 'seller_agreement', 'return_policy', 'shipping_policy', 'other'],
    required: [true, 'Document type is required']
  },
  content: {
    type: String,
    required: [true, 'Document content is required']
  },
  version: {
    type: String,
    required: [true, 'Document version is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveDate: {
    type: Date,
    required: [true, 'Effective date is required'],
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  summary: {
    type: String,
    trim: true
  },
  mustAcceptVersion: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for type and version
LegalDocumentSchema.index({ type: 1, version: 1 }, { unique: true });

// Index for active documents
LegalDocumentSchema.index({ isActive: 1, type: 1 });

// Method to get current active document of a specific type
LegalDocumentSchema.statics.getActiveDocument = async function(type) {
  return this.findOne({ type, isActive: true }).sort({ effectiveDate: -1 });
};

// Method to deactivate old versions of the same type when creating a new version
LegalDocumentSchema.statics.deactivateOldVersions = async function(type) {
  return this.updateMany(
    { type, isActive: true },
    { isActive: false }
  );
};

module.exports = mongoose.model('LegalDocument', LegalDocumentSchema); 