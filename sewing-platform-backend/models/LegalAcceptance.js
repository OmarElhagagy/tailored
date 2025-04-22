const mongoose = require('mongoose');
const { Schema } = mongoose;

const LegalAcceptanceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'LegalDocument',
    required: [true, 'Document ID is required']
  },
  documentType: {
    type: String,
    enum: ['terms_of_service', 'privacy_policy', 'seller_agreement', 'return_policy', 'shipping_policy', 'other'],
    required: [true, 'Document type is required']
  },
  documentVersion: {
    type: String,
    required: [true, 'Document version is required']
  },
  acceptanceDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Acceptance date is required']
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required']
  },
  userAgent: {
    type: String
  },
  acceptanceMethod: {
    type: String,
    enum: ['registration', 'login', 'order_placement', 'explicit_acceptance', 'other'],
    required: [true, 'Acceptance method is required']
  }
}, {
  timestamps: true
});

// Compound index for user and document
LegalAcceptanceSchema.index({ userId: 1, documentType: 1, documentVersion: 1 }, { unique: true });

// Index for querying by document
LegalAcceptanceSchema.index({ documentId: 1 });

// Method to check if a user has accepted the latest version of a document type
LegalAcceptanceSchema.statics.hasAcceptedLatest = async function(userId, documentType) {
  const LegalDocument = mongoose.model('LegalDocument');
  
  // Get the latest active version of the document
  const latestDocument = await LegalDocument.getActiveDocument(documentType);
  
  if (!latestDocument) {
    return false;
  }
  
  // Check if the user has accepted this version
  const acceptance = await this.findOne({
    userId,
    documentType,
    documentVersion: latestDocument.version
  });
  
  return !!acceptance;
};

// Method to record a new acceptance
LegalAcceptanceSchema.statics.recordAcceptance = async function(data) {
  // Check if this combination already exists
  const existing = await this.findOne({
    userId: data.userId,
    documentType: data.documentType,
    documentVersion: data.documentVersion
  });
  
  if (existing) {
    // Update the existing record
    existing.acceptanceDate = Date.now();
    existing.ipAddress = data.ipAddress;
    existing.userAgent = data.userAgent;
    existing.acceptanceMethod = data.acceptanceMethod;
    return existing.save();
  }
  
  // Create a new record
  return this.create(data);
};

module.exports = mongoose.model('LegalAcceptance', LegalAcceptanceSchema); 