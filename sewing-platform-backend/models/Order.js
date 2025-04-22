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
  materialChoice: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
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
    enum: ['cash', 'cashOnDelivery', 'vodafoneCash', 'creditCard', 'fawry', 'bankTransfer', 'instaPay'],
    required: [true, 'Payment method is required'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentTransactions: [{
    transactionId: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded']
    },
    provider: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'standard', 'express', 'overnight'],
      default: 'standard'
    },
    fee: {
      type: Number,
      default: 0
    },
    estimatedDays: {
      min: Number,
      max: Number
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    carrier: String,
    trackingInfo: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      statusHistory: [{
        status: {
          type: String,
          enum: [
            'info_received', 
            'in_transit', 
            'out_for_delivery', 
            'delivery_attempt', 
            'exception', 
            'delivered'
          ]
        },
        location: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        description: String
      }],
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      estimatedDelivery: Date,
      // Enhanced tracking fields
      currentStatus: {
        type: String,
        enum: [
          'pending',
          'info_received', 
          'in_transit', 
          'out_for_delivery', 
          'delivery_attempt', 
          'exception', 
          'delivered'
        ],
        default: 'pending'
      },
      notificationsEnabled: {
        type: Boolean,
        default: true
      },
      lastNotificationSent: Date,
      signatureRequired: {
        type: Boolean,
        default: false
      },
      actualDeliveryPhoto: String,
      deliveryInstructions: String,
      delayReason: String
    },
    pickupDate: Date,
    pickupLocation: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      notes: String
    },
    actualDelivery: Date,
    shippingLabel: String, // URL to shipping label PDF
    lastUpdated: Date
  },
  price: {
    base: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    materialCost: {
      type: Number,
      default: 0,
      min: 0
    },
    weightBasedCost: {
      type: Number,
      default: 0,
      min: 0
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
    bulkDiscount: {
      type: Number,
      default: 0,
      min: 0
    },
    handlingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    priceCalculationMethod: {
      type: String,
      enum: ['fixed', 'weight_based', 'material_based', 'custom'],
      default: 'fixed'
    }
  },
  rating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    timestamp: Date,
    sellerReply: String,
    sellerReplyDate: Date,
    photos: [{
      url: String,
      caption: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }],
    aspects: {
      quality: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      delivery: {
        type: Number,
        min: 1,
        max: 5
      },
      valueForMoney: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  },
  orderNotes: [{
    note: {
      type: String,
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userRole: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
  orderImages: [{
    url: String,
    caption: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  cancellationReason: {
    reason: String,
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    requestDate: Date
  },
  termsAccepted: {
    type: Boolean,
    default: false,
    required: [true, 'Terms must be accepted to place an order']
  },
  termsAcceptedDate: {
    type: Date
  },
  // User-friendly progress tracker
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Simple milestone tracking for non-technical users
  milestones: [{
    name: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    description: String
  }],
  // Visual timeline for easy understanding
  displayTimeline: {
    type: Boolean,
    default: true
  },
  // Communication preferences
  communicationPreferences: {
    sendEmailUpdates: {
      type: Boolean,
      default: true
    },
    updateFrequency: {
      type: String,
      enum: ['every_update', 'daily', 'weekly', 'major_changes_only'],
      default: 'major_changes_only'
    }
  },
  // Trust and verification features
  verifications: {
    paymentVerified: {
      type: Boolean,
      default: false
    },
    identityVerified: {
      type: Boolean,
      default: false
    },
    escrowEnabled: {
      type: Boolean,
      default: false
    }
  },
  // Quality assurance
  qualityCheck: {
    required: {
      type: Boolean,
      default: false
    },
    completed: {
      type: Boolean,
      default: false
    },
    photos: [String],
    notes: String,
    checkDate: Date
  },
  // Transparent transaction
  transactionSummary: {
    moneyBackEligible: {
      type: Boolean,
      default: true
    },
    guaranteePeriodDays: {
      type: Number,
      default: 30
    },
    disputeAvailable: {
      type: Boolean,
      default: true
    }
  },
  // Return request and processing
  returnRequest: {
    requested: {
      type: Boolean,
      default: false
    },
    requestDate: Date,
    reason: {
      type: String,
      enum: ['defect', 'wrong_size', 'not_as_described', 'changed_mind', 'damaged_in_shipping', 'other'],
    },
    defectDescription: String,
    defectPhotos: [String],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'canceled'],
    },
    approvedAction: {
      type: String,
      enum: ['full_refund', 'partial_refund', 'replacement', 'repair', 'store_credit'],
    },
    refundAmount: Number,
    returnShippingPaidBy: {
      type: String,
      enum: ['buyer', 'seller'],
    },
    returnShippingLabel: String, // URL to return shipping label if seller pays
    returnTracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String
    },
    sellerNotes: String,
    resolvedDate: Date
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
  if (this.isModified('price.base') || 
      this.isModified('price.materialCost') || 
      this.isModified('price.weightBasedCost') ||
      this.isModified('price.customizationFee') || 
      this.isModified('price.deliveryFee') || 
      this.isModified('price.bulkDiscount') ||
      this.isModified('price.handlingFee') ||
      this.isModified('price.platformFee') ||
      this.isModified('quantity')) {
    
    // Calculate subtotal based on pricing method
    const { 
      base, 
      materialCost, 
      weightBasedCost,
      customizationFee, 
      deliveryFee, 
      bulkDiscount, 
      handlingFee,
      platformFee,
      priceCalculationMethod
    } = this.price;

    let baseAmount = 0;
    
    // Set the base amount based on pricing method
    if (priceCalculationMethod === 'fixed') {
      baseAmount = base * this.quantity;
    } else if (priceCalculationMethod === 'weight_based' && this.weight) {
      baseAmount = weightBasedCost;
    } else if (priceCalculationMethod === 'material_based' && this.materialChoice) {
      baseAmount = materialCost;
    } else if (priceCalculationMethod === 'custom') {
      // Custom pricing already calculated and stored in base
      baseAmount = base;
    } else {
      // Default to fixed pricing
      baseAmount = base * this.quantity;
    }

    // Calculate subtotal
    this.price.subtotal = (baseAmount + customizationFee + deliveryFee + handlingFee + platformFee - bulkDiscount).toFixed(2);
    
    // Calculate tax amount based on subtotal
    this.price.taxAmount = (this.price.subtotal * this.price.taxRate).toFixed(2);
    
    // Calculate total including tax
    this.price.total = (parseFloat(this.price.subtotal) + parseFloat(this.price.taxAmount)).toFixed(2);
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
  
  // Update progress percentage based on status
  const statusProgressMap = {
    'pending': 10,
    'accepted': 25,
    'making': 50,
    'ready': 75,
    'delivered': 90,
    'completed': 100,
    'canceled': 0,
    'disputed': 50
  };
  
  this.progressPercentage = statusProgressMap[newStatus] || this.progressPercentage;
  
  // Update milestones based on status
  if (newStatus === 'accepted' && !this.hasMilestone('Order Accepted')) {
    this.addMilestone('Order Accepted', 'Seller has accepted your order and will begin working on it soon');
  } else if (newStatus === 'making' && !this.hasMilestone('Production Started')) {
    this.addMilestone('Production Started', 'Your order is now being made');
  } else if (newStatus === 'ready' && !this.hasMilestone('Ready for Delivery')) {
    this.addMilestone('Ready for Delivery', 'Your order is complete and ready for pickup or delivery');
  } else if (newStatus === 'delivered' && !this.hasMilestone('Delivered')) {
    this.addMilestone('Delivered', 'Your order has been delivered');
  } else if (newStatus === 'completed' && !this.hasMilestone('Order Completed')) {
    this.addMilestone('Order Completed', 'Your order is now complete. Thank you!');
  }
  
  return this.save();
};

// Helper method to check if a milestone exists
OrderSchema.methods.hasMilestone = function(milestoneName) {
  return this.milestones.some(m => m.name === milestoneName);
};

// Helper method to add a milestone
OrderSchema.methods.addMilestone = function(name, description = '') {
  this.milestones.push({
    name,
    isCompleted: true,
    completedDate: new Date(),
    description
  });
};

// Method to add a payment transaction
OrderSchema.methods.addPaymentTransaction = function(transaction) {
  this.paymentTransactions.push(transaction);
  
  // Update payment status based on total paid amount
  const totalPaid = this.paymentTransactions.reduce((sum, tx) => {
    return tx.status === 'completed' ? sum + tx.amount : sum;
  }, 0);
  
  if (totalPaid >= this.price.total) {
    this.paymentStatus = 'paid';
  } else if (totalPaid > 0) {
    this.paymentStatus = 'partial';
  }
  
  return this.save();
};

// Method to add order note
OrderSchema.methods.addNote = function(note, userId, userRole, isPrivate = false) {
  this.orderNotes.push({
    note,
    createdBy: userId,
    userRole,
    timestamp: new Date(),
    isPrivate
  });
  
  return this.save();
};

// Method to enable escrow payment for added trust
OrderSchema.methods.enableEscrow = function() {
  this.verifications.escrowEnabled = true;
  
  // Add a note about escrow protection
  this.orderNotes.push({
    note: 'Escrow payment protection enabled. The payment will be held safely until you confirm the order is received as described.',
    createdBy: this.buyerId,
    userRole: 'system',
    timestamp: new Date(),
    isPrivate: false
  });
  
  return this.save();
};

// Method to request quality check
OrderSchema.methods.requestQualityCheck = function(requireCheck = true) {
  this.qualityCheck.required = requireCheck;
  
  // Add a note about quality check
  if (requireCheck) {
    this.orderNotes.push({
      note: 'Quality check requested. The seller will provide photos and notes before shipping.',
      createdBy: this.buyerId,
      userRole: 'system',
      timestamp: new Date(),
      isPrivate: false
    });
  }
  
  return this.save();
};

// Method to complete quality check
OrderSchema.methods.completeQualityCheck = function(notes, photoUrls = []) {
  this.qualityCheck.completed = true;
  this.qualityCheck.notes = notes;
  this.qualityCheck.photos = photoUrls;
  this.qualityCheck.checkDate = new Date();
  
  // Add a note about completed quality check
  this.orderNotes.push({
    note: 'Quality check completed by seller.',
    createdBy: this.sellerId,
    userRole: 'system',
    timestamp: new Date(),
    isPrivate: false
  });
  
  return this.save();
};

// Method to submit a return request
OrderSchema.methods.submitReturnRequest = function(reason, description = '', photoUrls = []) {
  // Check if order is eligible for return
  const deliveredDate = this.getDeliveryDate();
  const currentDate = new Date();
  
  // Validate that the order was delivered
  if (!deliveredDate) {
    throw new Error('Cannot request return for an order that has not been delivered');
  }
  
  // Get return policy from linked listing
  let returnPeriodDays = 30; // Default
  let buyerPaysReturn = false;
  
  // Get return period from listing if possible
  if (this.listingId && this.listingId.returnPolicy) {
    returnPeriodDays = this.listingId.returnPolicy.returnPeriodDays || returnPeriodDays;
    buyerPaysReturn = this.listingId.returnPolicy.buyerPaysReturn || buyerPaysReturn;
  }
  
  // Check if return is within the allowed period
  const daysSinceDelivery = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceDelivery > returnPeriodDays) {
    throw new Error(`Return period of ${returnPeriodDays} days has expired`);
  }
  
  // Create the return request
  this.returnRequest = {
    requested: true,
    requestDate: currentDate,
    reason,
    defectDescription: description,
    defectPhotos: photoUrls,
    status: 'pending',
    returnShippingPaidBy: buyerPaysReturn ? 'buyer' : 'seller'
  };
  
  // Add a note about the return request
  this.orderNotes.push({
    note: `Return requested. Reason: ${reason}${description ? ` - ${description}` : ''}`,
    createdBy: this.buyerId,
    userRole: 'buyer',
    timestamp: currentDate,
    isPrivate: false
  });
  
  return this.save();
};

// Method to process a return request (for seller)
OrderSchema.methods.processReturnRequest = function(decision, action, notes = '', refundAmount = null) {
  if (!this.returnRequest || !this.returnRequest.requested) {
    throw new Error('No return request exists for this order');
  }
  
  if (this.returnRequest.status !== 'pending') {
    throw new Error(`Cannot process return that is already ${this.returnRequest.status}`);
  }
  
  const currentDate = new Date();
  
  // Update return request status
  this.returnRequest.status = decision === 'approve' ? 'approved' : 'rejected';
  
  if (decision === 'approve') {
    this.returnRequest.approvedAction = action;
    
    if (action === 'full_refund' || action === 'partial_refund') {
      this.returnRequest.refundAmount = action === 'full_refund' ? this.price.total : refundAmount;
    }
    
    this.returnRequest.sellerNotes = notes;
  } else {
    this.returnRequest.sellerNotes = notes;
  }
  
  // Add a note about the decision
  this.orderNotes.push({
    note: `Return request ${decision === 'approve' ? 'approved' : 'rejected'}. ${notes}`,
    createdBy: this.sellerId,
    userRole: 'seller',
    timestamp: currentDate,
    isPrivate: false
  });
  
  return this.save();
};

// Helper to get delivery date
OrderSchema.methods.getDeliveryDate = function() {
  const deliveredStatus = this.statusHistory.find(status => status.status === 'delivered');
  return deliveredStatus ? deliveredStatus.timestamp : null;
};

// Method to complete a return
OrderSchema.methods.completeReturn = function(refundTransactionId = null) {
  if (!this.returnRequest || !this.returnRequest.requested) {
    throw new Error('No return request exists for this order');
  }
  
  if (this.returnRequest.status !== 'approved') {
    throw new Error('Cannot complete a return that has not been approved');
  }
  
  const currentDate = new Date();
  
  // Mark return as completed
  this.returnRequest.status = 'completed';
  this.returnRequest.resolvedDate = currentDate;
  
  // If there was a refund, record the transaction
  if (refundTransactionId && (this.returnRequest.approvedAction === 'full_refund' || this.returnRequest.approvedAction === 'partial_refund')) {
    this.paymentTransactions.push({
      transactionId: refundTransactionId,
      amount: -this.returnRequest.refundAmount, // Negative amount for refund
      status: 'completed',
      provider: 'refund',
      timestamp: currentDate,
      notes: `Refund for return. Reason: ${this.returnRequest.reason}`
    });
  }
  
  // Add a note about completion
  this.orderNotes.push({
    note: `Return completed. ${this.returnRequest.approvedAction === 'full_refund' || this.returnRequest.approvedAction === 'partial_refund' 
      ? `Refund of $${this.returnRequest.refundAmount} issued.` 
      : `Action taken: ${this.returnRequest.approvedAction}`}`,
    createdBy: this.sellerId,
    userRole: 'system',
    timestamp: currentDate,
    isPrivate: false
  });
  
  return this.save();
};

module.exports = mongoose.model('Order', OrderSchema);
