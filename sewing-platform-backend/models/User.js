const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: { unique: true, sparse: true },
    validate: {
      validator: function(v) {
        return v === null || v === '' || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    required: [true, 'User role is required'],
    default: 'buyer'
  },
  name: {
    type: String,
    trim: true,
    required: function() { return this.role === 'buyer'; }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{9,14}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  businessName: {
    type: String,
    trim: true,
    required: function() { return this.role === 'seller'; }
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for seller's listings
UserSchema.virtual('listings', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'sellerId'
});

// Virtual for inventory items
UserSchema.virtual('inventory', {
  ref: 'InventoryItem',
  localField: '_id',
  foreignField: 'sellerId'
});

// Virtual for orders as buyer
UserSchema.virtual('buyerOrders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'buyerId'
});

// Virtual for orders as seller
UserSchema.virtual('sellerOrders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'sellerId'
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
