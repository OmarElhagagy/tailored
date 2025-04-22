const mongoose = require('mongoose');
const { Schema } = mongoose;

const BusinessCredentialSchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
    index: true
  },
  documentType: {
    type: String,
    enum: ['business_license', 'tax_id', 'identity_document', 'certification', 'other'],
    required: [true, 'Document type is required']
  },
  documentNumber: {
    type: String,
    required: [true, 'Document number is required']
  },
  issuingAuthority: {
    type: String,
    required: [true, 'Issuing authority is required']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  expiryDate: {
    type: Date
  },
  documentFile: {
    type: String,  // Path to stored document
    required: [true, 'Document file is required']
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDate: {
    type: Date
  },
  verificationNote: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
BusinessCredentialSchema.index({ sellerId: 1, documentType: 1 });
BusinessCredentialSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('BusinessCredential', BusinessCredentialSchema); 