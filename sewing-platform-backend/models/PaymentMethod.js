const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentMethodSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'other'],
    required: true
  },
  lastFour: {
    type: String,
    required: true
  },
  expiryMonth: String,
  expiryYear: String,
  nameOnCard: String,
  brand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'other']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  tokenizedData: {
    type: String,
    required: true
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  riskScore: {
    type: Number,
    default: 0
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
PaymentMethodSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Make a payment method the default for a user
PaymentMethodSchema.methods.makeDefault = async function() {
  // First, unset any current default payment methods for this user
  await this.constructor.updateMany(
    { user: this.user, isDefault: true },
    { isDefault: false }
  );
  
  // Then set this payment method as default
  this.isDefault = true;
  return this.save();
};

// Static method to find default payment method for a user
PaymentMethodSchema.statics.findDefaultForUser = function(userId) {
  return this.findOne({ user: userId, isDefault: true });
};

// Static method to get all payment methods for a user
PaymentMethodSchema.statics.findAllForUser = function(userId) {
  return this.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

// Virtual for masked card number display
PaymentMethodSchema.virtual('maskedNumber').get(function() {
  return `•••• •••• •••• ${this.lastFour}`;
});

// Virtual for card expiry display
PaymentMethodSchema.virtual('expiryDisplay').get(function() {
  return `${this.expiryMonth}/${this.expiryYear}`;
});

module.exports = mongoose.model('paymentMethod', PaymentMethodSchema); 