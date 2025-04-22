const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'order',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentDetails: {
    lastFour: String,
    expiryMonth: String,
    expiryYear: String,
    nameOnCard: String,
    brand: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  refunds: [{
    amount: Number,
    reason: String,
    transactionId: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  fraudRiskScore: {
    type: Number,
    default: 0
  },
  fraudRiskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to set updatedAt date
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted date
PaymentSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to create a refund
PaymentSchema.methods.createRefund = async function(amount, reason) {
  // In a real implementation, you would interact with payment gateway
  // to process the actual refund before recording it here
  
  this.refunds.push({
    amount,
    reason,
    transactionId: `refund_${Date.now()}`,
    date: Date.now()
  });
  
  // Update payment status based on refund amount
  const totalRefunded = this.refunds.reduce((sum, refund) => sum + refund.amount, 0);
  
  if (totalRefunded >= this.amount) {
    this.status = 'refunded';
  } else if (totalRefunded > 0) {
    this.status = 'partially_refunded';
  }
  
  return this.save();
};

// Method to get total refunded amount
PaymentSchema.methods.getTotalRefunded = function() {
  return this.refunds.reduce((sum, refund) => sum + refund.amount, 0);
};

module.exports = mongoose.model('payment', PaymentSchema); 