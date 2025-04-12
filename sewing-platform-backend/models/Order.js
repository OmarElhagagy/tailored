const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required'],
    index: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
    index: true
  },
  listingId: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  customRequest: {
    type: String,
    trim: true
  },
  customizationChoices: {
    type: Map,
    of: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'making', 'ready', 'delivered', 'canceled', 'completed', 'disputed'],
    default: 'pending',
    required: true,
    index: true
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'accepted', 'making', 'ready', 'delivered', 'canceled', 'completed', 'disputed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  scheduledDay: {
    type: Date,
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Scheduled day cannot be in the past'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'negotiated', 'online', 'bank_transfer'],
    required: [true, 'Payment method is required'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: String,
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    notes: String
  },
  price: {
    base: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    customizationFee: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    }
  },
  trackingInfo: {
    courier: String,
    trackingNumber: String,
    estimatedDelivery: Date
  },
  rating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    timestamp: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for messages related to this order
OrderSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'orderId'
});

// Compound index for filtering orders by seller and status
OrderSchema.index({ sellerId: 1, status: 1 });

// Compound index for filtering orders by buyer and status
OrderSchema.index({ buyerId: 1, status: 1 });

// Index for date-based queries
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ scheduledDay: 1 });

// Calculate total price
OrderSchema.pre('save', function(next) {
  if (this.isModified('price.base') || this.isModified('price.customizationFee') || 
      this.isModified('price.deliveryFee') || this.isModified('price.discount')) {
    const { base, customizationFee, deliveryFee, discount } = this.price;
    this.price.total = (base + customizationFee + deliveryFee - discount) * this.quantity;
  }
  next();
});

// Method to update order status with history
OrderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note
  });
  return this.save();
};

module.exports = mongoose.model('Order', OrderSchema);
