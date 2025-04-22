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
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return v === null || v === '' || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid contact email address'
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
    required: [true, 'Phone number is required'],
    trim: true,
    index: { unique: true },
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{9,14}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  // Phone verification fields
  phoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  phoneVerificationAttempts: {
    type: Number,
    default: 0
  },
  // Password reset fields (updated to support SMS)
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  resetPasswordAttempts: {
    type: Number,
    default: 0
  },
  // Two-factor authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorCode: String,
  twoFactorExpires: Date,
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
  credentialVerificationStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'verified', 'rejected'],
    default: 'not_submitted'
  },
  credentialVerificationDate: Date,
  credentialRejectionReason: String,
  businessDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Business description cannot exceed 500 characters']
  },
  businessWebsite: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return v === null || v === '' || /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(v);
      },
      message: 'Please enter a valid website URL'
    }
  },
  businessEstablishedYear: {
    type: Number,
    min: [1900, 'Establishment year must be 1900 or later'],
    max: [new Date().getFullYear(), 'Establishment year cannot be in the future']
  },
  // Enhanced seller profile
  sellerProfile: {
    // Bio and expertise
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    expertiseLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert', 'master'],
      default: 'intermediate'
    },
    specialties: [String],
    languages: [String],
    
    // Storefront customization
    bannerImage: String,
    logoImage: String,
    brandColor: String,
    
    // Social proof
    socialLinks: {
      instagram: String,
      facebook: String,
      pinterest: String,
      tiktok: String,
      youtube: String,
      website: String
    },
    
    // Payment preferences
    paymentMethods: {
      cash: {
        type: Boolean,
        default: true
      },
      cashOnDelivery: {
        type: Boolean,
        default: true
      },
      vodafoneCash: {
        type: Boolean,
        default: false
      },
      fawry: {
        type: Boolean,
        default: false
      },
      instaPay: {
        type: Boolean,
        default: false
      },
      creditCard: {
        type: Boolean,
        default: false
      },
      bankTransfer: {
        type: Boolean,
        default: false
      }
    },
    paymentInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Payment instructions cannot exceed 500 characters']
    },
    
    // Contact information - for public display
    contactInfo: {
      preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'messaging'],
        default: 'messaging'
      },
      publicNote: {
        type: String,
        trim: true,
        maxlength: [200, 'Public note cannot exceed 200 characters']
      },
      displayBusinessHours: {
        type: Boolean,
        default: true
      }
    },
    
    // Availability and scheduling
    availability: {
      type: String,
      enum: ['full_time', 'part_time', 'weekends_only', 'custom'],
      default: 'full_time'
    },
    businessHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      open: String, // Format: "09:00"
      close: String, // Format: "17:00"
      closed: Boolean
    }],
    
    // Production capacity
    productionCapacity: {
      maxOrdersPerWeek: Number,
      maxCustomOrdersPerMonth: Number,
      currentBacklogDays: {
        type: Number,
        default: 0
      }
    },
    
    // Services offered
    servicesOffered: [String],
    
    // Certification and credentials
    certifications: [{
      name: String,
      issuer: String,
      year: Number,
      verified: Boolean
    }],
    
    // Shop policies
    policies: {
      customOrderPolicy: String,
      returnPolicy: String,
      shippingPolicy: String,
      cancellationPolicy: String
    },
    
    // Portfolio showcase
    portfolioProjects: [{
      title: String,
      description: String,
      images: [String],
      year: Number,
      featured: Boolean
    }]
  },
  // Enhanced messaging settings
  messagingSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    notifyNewMessages: {
      type: Boolean,
      default: true
    },
    notifyOrderMessages: {
      type: Boolean,
      default: true
    },
    autoReplyEnabled: {
      type: Boolean,
      default: false
    },
    autoReplyMessage: {
      type: String,
      default: "Thank you for your message! I'll get back to you as soon as possible."
    },
    businessHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      autoReplyOutsideHours: {
        type: Boolean,
        default: false
      },
      outsideHoursMessage: {
        type: String,
        default: "Thanks for your message! I'm currently outside my business hours and will respond when I return."
      }
    },
    messageSound: {
      type: Boolean,
      default: true
    }
  },
  // Message templates for quick responses
  messageTemplates: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['general', 'order_confirmation', 'shipping_info', 'custom_request', 'follow_up'],
      default: 'general'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Store statistics for dashboard
  storeStats: {
    averageResponseTime: Number, // in minutes
    responseRate: Number, // percentage
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    repeatCustomerRate: Number, // percentage
    popularCategories: [{
      name: String,
      count: Number
    }],
    averageOrderValue: Number
  },
  resetPasswordToken: String,
  active: {
    type: Boolean,
    default: true
  },
  accountVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  lastLogin: Date,
  profilePicture: {
    type: String,
    default: 'default-profile.jpg'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  privacySettings: {
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    }
  },
  // Add wishlist functionality
  wishlist: [{
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notifyOnPriceChange: {
      type: Boolean,
      default: true
    },
    initialPrice: {
      type: Number
    },
    notes: String
  }],
  // Add saved searches
  savedSearches: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    query: {
      type: Object,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastRun: Date,
    emailNotifications: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'never'],
        default: 'never'
      },
      lastSent: Date
    }
  }]
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

// Virtual for business credentials
UserSchema.virtual('businessCredentials', {
  ref: 'BusinessCredential',
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

// Index for geospatial queries
UserSchema.index({ location: '2dsphere' });

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

// Check if seller is verified
UserSchema.methods.isVerifiedSeller = function() {
  return this.role === 'seller' && this.credentialVerificationStatus === 'verified';
};

// Update credential verification status
UserSchema.methods.updateCredentialStatus = function(status, reason = '') {
  this.credentialVerificationStatus = status;
  this.credentialVerificationDate = Date.now();
  
  if (status === 'rejected') {
    this.credentialRejectionReason = reason;
  } else {
    this.credentialRejectionReason = '';
  }
  
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
