const mongoose = require('mongoose');
const { Schema } = mongoose;

const ListingSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Listing title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
    index: true
  },
  photos: [{
    type: String,
    default: 'default-listing.jpg'
  }],
  mainPhoto: {
    type: String,
    default: 'default-listing.jpg'
  },
  inventoryItems: [{
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem'
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  customizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: [{
    name: String,
    choices: [String]
  }],
  estimatedMakingTime: {
    type: Number, // in days
    min: [0, 'Making time cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive', 'draft'],
    default: 'active',
    index: true
  },
  views: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Seller-defined delivery options
  deliveryOptions: [{
    method: {
      type: String,
      enum: ['pickup', 'standard', 'express', 'overnight'],
      required: true
    },
    fee: {
      type: Number,
      required: true,
      min: 0
    },
    estimatedDays: {
      min: Number,
      max: Number
    },
    description: String,
    availableLocations: [String] // e.g., ['USA', 'Canada'] or ['New York', 'Los Angeles']
  }],
  // Seller-defined bulk discounts
  bulkDiscounts: [{
    minimumQuantity: {
      type: Number,
      required: true,
      min: 2
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    description: String
  }],
  // Material cost calculation method
  priceCalculation: {
    type: String,
    enum: ['fixed', 'weight_based', 'material_based', 'custom'],
    default: 'fixed'
  },
  // For weight-based pricing
  pricePerKg: {
    type: Number,
    min: 0,
    default: 0
  },
  // For material-based or custom pricing
  materialCostFactors: {
    baseCost: {
      type: Number,
      min: 0,
      default: 0
    },
    additionalFactors: [{
      name: String,
      costMultiplier: Number,
      description: String
    }]
  },
  // Available materials for material-based pricing
  availableMaterials: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    priceMultiplier: {
      type: Number,
      required: true,
      min: 0.1,
      default: 1
    }
  }],
  // Simplified pricing templates for non-technical sellers
  pricingTemplate: {
    type: String,
    enum: ['basic', 'premium', 'custom', 'none'],
    default: 'none',
    description: 'Predefined pricing templates to simplify seller experience'
  },
  // Visual pricing breakdown for buyers
  showPricingBreakdown: {
    type: Boolean,
    default: true,
    description: 'Whether to show detailed price breakdown to buyers'
  },
  // Simplified delivery estimates in human-readable format
  deliveryEstimate: {
    type: String,
    trim: true,
    description: 'Simple human-readable delivery time estimate (e.g., "3-5 days", "1-2 weeks")'
  },
  // Trust badges and verification
  trustIndicators: {
    qualityGuaranteed: {
      type: Boolean,
      default: true
    },
    securePayment: {
      type: Boolean,
      default: true
    },
    moneyBackGuarantee: {
      type: Boolean,
      default: true
    },
    verifiedSeller: {
      type: Boolean,
      default: false
    }
  },
  // Transparency information
  transparency: {
    materialsEthicallySourced: {
      type: Boolean,
      default: false
    },
    handmadeVerified: {
      type: Boolean,
      default: true
    },
    sustainabilityRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    madeIn: {
      type: String,
      trim: true
    }
  },
  // FAQ section for buyer confidence
  frequentlyAskedQuestions: [{
    question: String,
    answer: String
  }],
  // Social proof
  completedOrdersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Return policy options
  returnPolicy: {
    acceptsReturns: {
      type: Boolean,
      default: true
    },
    returnPeriodDays: {
      type: Number,
      default: 30,
      min: 0
    },
    defectPolicy: {
      type: String,
      enum: ['full_refund', 'replacement', 'partial_refund', 'repair', 'store_credit', 'no_returns'],
      default: 'full_refund'
    },
    sizeFitReturnPolicy: {
      type: String,
      enum: ['full_refund', 'exchange_only', 'store_credit', 'no_returns'],
      default: 'exchange_only'
    },
    buyerPaysReturn: {
      type: Boolean,
      default: false
    },
    additionalConditions: String,
    returnInstructions: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for orders related to this listing
ListingSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'listingId'
});

// Text search index
ListingSchema.index(
  { title: 'text', description: 'text', tags: 'text', 'availableMaterials.name': 'text' },
  { name: 'listing_text_index', weights: { title: 10, description: 5, tags: 3, 'availableMaterials.name': 8 } }
);

// Compound index for filtering by category and price
ListingSchema.index({ category: 1, price: 1 });

// Index for material name to improve partial search performance
ListingSchema.index({ 'availableMaterials.name': 1 });

// Method to check if listing has enough inventory
ListingSchema.methods.checkInventory = async function() {
  const InventoryItem = mongoose.model('InventoryItem');
  
  for (const item of this.inventoryItems) {
    const inventoryItem = await InventoryItem.findById(item.itemId);
    if (!inventoryItem || inventoryItem.stock < item.quantity) {
      return false;
    }
  }
  return true;
};

// Method to calculate delivery fee based on method
ListingSchema.methods.getDeliveryFee = function(deliveryMethod) {
  if (!this.deliveryOptions || this.deliveryOptions.length === 0) {
    // Default fees if no options defined
    const defaultFees = {
      pickup: 0,
      standard: 15.00,
      express: 30.00,
      overnight: 45.00
    };
    return defaultFees[deliveryMethod] || 15.00;
  }
  
  const selectedOption = this.deliveryOptions.find(option => option.method === deliveryMethod);
  return selectedOption ? selectedOption.fee : 15.00; // Default to 15.00 if not found
};

// Method to calculate bulk discount based on quantity
ListingSchema.methods.getBulkDiscount = function(quantity, totalPrice) {
  if (!this.bulkDiscounts || this.bulkDiscounts.length === 0) {
    // Default discount logic if no options defined
    if (quantity >= 10) {
      return totalPrice * 0.10; // 10% discount for 10+ items
    } else if (quantity >= 5) {
      return totalPrice * 0.05; // 5% discount for 5+ items
    }
    return 0;
  }
  
  // Find the highest applicable discount
  let highestDiscount = 0;
  
  for (const discount of this.bulkDiscounts) {
    if (quantity >= discount.minimumQuantity && discount.discountPercentage > highestDiscount) {
      highestDiscount = discount.discountPercentage;
    }
  }
  
  return totalPrice * (highestDiscount / 100);
};

// Method to calculate price based on weight and materials
ListingSchema.methods.calculateTotalPrice = function(quantity = 1, customOptions = {}) {
  let basePrice = this.price;
  let materialCost = 0;
  let weightBasedCost = 0;
  
  // Apply pricing template if selected
  if (this.pricingTemplate !== 'none') {
    this.applyPricingTemplate();
  }
  
  // Calculate price based on calculation method
  if (this.priceCalculation === 'weight_based' && this.weight && this.weight.value > 0 && this.pricePerKg > 0) {
    weightBasedCost = this.weight.value * this.pricePerKg;
    basePrice = weightBasedCost;
  } else if (this.priceCalculation === 'material_based' && this.materialCostFactors) {
    basePrice = this.materialCostFactors.baseCost;
    
    // Apply additional cost factors
    if (this.materialCostFactors.additionalFactors && this.materialCostFactors.additionalFactors.length > 0) {
      for (const factor of this.materialCostFactors.additionalFactors) {
        basePrice *= factor.costMultiplier;
      }
    }
    
    // Apply material choice if specified in custom options
    if (customOptions.materialChoice && this.availableMaterials && this.availableMaterials.length > 0) {
      const selectedMaterial = this.availableMaterials.find(m => m.name === customOptions.materialChoice);
      if (selectedMaterial) {
        materialCost = basePrice * (selectedMaterial.priceMultiplier - 1);
        basePrice *= selectedMaterial.priceMultiplier;
      }
    }
  } else if (this.priceCalculation === 'custom') {
    // Custom pricing logic can be implemented here
    // For now, use base price and apply any custom adjustments
    if (customOptions.customPriceAdjustment) {
      basePrice += customOptions.customPriceAdjustment;
    }
  }
  
  // Calculate customization fee
  let customizationFee = 0;
  if (this.customizable && customOptions.customizationChoices && Object.keys(customOptions.customizationChoices).length > 0) {
    customizationFee = Object.keys(customOptions.customizationChoices).length * 10; // $10 per customization
  }
  
  // Multiply by quantity
  const totalBasePrice = basePrice * quantity;
  
  return {
    basePrice,
    totalBasePrice,
    materialCost,
    weightBasedCost,
    customizationFee,
    platformFee: 0, // Platform fee placeholder for future implementation
    priceCalculationMethod: this.priceCalculation
  };
};

// Method to apply simplified pricing templates
ListingSchema.methods.applyPricingTemplate = function() {
  switch (this.pricingTemplate) {
    case 'basic':
      // Basic template: Simple fixed pricing with standard shipping
      this.priceCalculation = 'fixed';
      if (!this.deliveryOptions || this.deliveryOptions.length === 0) {
        this.deliveryOptions = [
          {
            method: 'standard',
            fee: 10.00,
            estimatedDays: { min: 3, max: 7 },
            description: 'Standard delivery (3-7 business days)'
          },
          {
            method: 'pickup',
            fee: 0,
            description: 'Free pickup from my location'
          }
        ];
      }
      // Simple bulk discount
      if (!this.bulkDiscounts || this.bulkDiscounts.length === 0) {
        this.bulkDiscounts = [
          {
            minimumQuantity: 5,
            discountPercentage: 5,
            description: '5% off for 5+ items'
          },
          {
            minimumQuantity: 10,
            discountPercentage: 10,
            description: '10% off for 10+ items'
          }
        ];
      }
      break;
      
    case 'premium':
      // Premium template: Weight-based pricing with more delivery options
      this.priceCalculation = 'weight_based';
      if (!this.pricePerKg || this.pricePerKg === 0) {
        this.pricePerKg = 20.00; // Default price per kg if not set
      }
      // Premium delivery options
      this.deliveryOptions = [
        {
          method: 'standard',
          fee: 12.00,
          estimatedDays: { min: 3, max: 5 },
          description: 'Standard delivery (3-5 business days)'
        },
        {
          method: 'express',
          fee: 25.00,
          estimatedDays: { min: 1, max: 2 },
          description: 'Express delivery (1-2 business days)'
        },
        {
          method: 'pickup',
          fee: 0,
          description: 'Free pickup from my location'
        }
      ];
      // Premium bulk discounts
      this.bulkDiscounts = [
        {
          minimumQuantity: 3,
          discountPercentage: 5,
          description: '5% off for 3+ items'
        },
        {
          minimumQuantity: 5,
          discountPercentage: 10,
          description: '10% off for 5+ items'
        },
        {
          minimumQuantity: 10,
          discountPercentage: 15,
          description: '15% off for 10+ items'
        }
      ];
      break;
      
    case 'custom':
      // Custom template just prepares the structure but lets seller customize values
      if (!this.deliveryOptions || this.deliveryOptions.length === 0) {
        this.deliveryOptions = [
          {
            method: 'standard',
            fee: 15.00,
            estimatedDays: { min: 5, max: 10 },
            description: 'Standard delivery'
          },
          {
            method: 'pickup',
            fee: 0,
            description: 'Free pickup'
          }
        ];
      }
      break;
  }
};

// Method to verify seller and update trust indicators
ListingSchema.methods.verifySellerCredentials = async function() {
  const User = mongoose.model('User');
  const seller = await User.findById(this.sellerId);
  
  if (seller && seller.credentialVerificationStatus === 'verified') {
    this.trustIndicators.verifiedSeller = true;
    return this.save();
  }
  
  return false;
};

// Method to add a frequently asked question
ListingSchema.methods.addFAQ = function(question, answer) {
  if (!this.frequentlyAskedQuestions) {
    this.frequentlyAskedQuestions = [];
  }
  
  this.frequentlyAskedQuestions.push({
    question,
    answer
  });
  
  return this.save();
};

// Method to update completed orders count
ListingSchema.methods.incrementOrderCount = function() {
  this.completedOrdersCount = (this.completedOrdersCount || 0) + 1;
  return this.save();
};

// Method to update sustainability information
ListingSchema.methods.updateSustainabilityInfo = function(isEthical, sustainabilityRating, madeIn) {
  this.transparency.materialsEthicallySourced = isEthical;
  
  if (sustainabilityRating !== undefined) {
    this.transparency.sustainabilityRating = Math.min(5, Math.max(0, sustainabilityRating));
  }
  
  if (madeIn) {
    this.transparency.madeIn = madeIn;
  }
  
  return this.save();
};

// Method to set up standard return policy
ListingSchema.methods.setupReturnPolicy = function(policyType = 'standard') {
  switch (policyType) {
    case 'no_returns':
      this.returnPolicy = {
        acceptsReturns: false,
        returnPeriodDays: 0,
        defectPolicy: 'no_returns',
        sizeFitReturnPolicy: 'no_returns',
        buyerPaysReturn: true,
        additionalConditions: 'All sales are final. No returns accepted.',
        returnInstructions: 'Returns are not accepted for this item.'
      };
      break;

    case 'defects_only':
      this.returnPolicy = {
        acceptsReturns: true,
        returnPeriodDays: 14,
        defectPolicy: 'full_refund',
        sizeFitReturnPolicy: 'no_returns',
        buyerPaysReturn: false,
        additionalConditions: 'Returns accepted only for defective items. Size/fit issues not eligible for return.',
        returnInstructions: 'If your item has a defect, please contact within 14 days with photos of the defect.'
      };
      break;

    case 'flexible':
      this.returnPolicy = {
        acceptsReturns: true,
        returnPeriodDays: 30,
        defectPolicy: 'full_refund',
        sizeFitReturnPolicy: 'exchange_only',
        buyerPaysReturn: true,
        additionalConditions: 'Items must be in original condition.',
        returnInstructions: 'Contact seller to initiate return. Buyer pays return shipping for size/fit issues.'
      };
      break;

    case 'premium':
      this.returnPolicy = {
        acceptsReturns: true,
        returnPeriodDays: 60,
        defectPolicy: 'full_refund',
        sizeFitReturnPolicy: 'full_refund',
        buyerPaysReturn: false,
        additionalConditions: 'Full satisfaction guarantee.',
        returnInstructions: 'Contact seller for return authorization. We provide prepaid return shipping label.'
      };
      break;

    case 'standard':
    default:
      this.returnPolicy = {
        acceptsReturns: true,
        returnPeriodDays: 30,
        defectPolicy: 'full_refund',
        sizeFitReturnPolicy: 'store_credit',
        buyerPaysReturn: true,
        additionalConditions: 'Items must be unused and in original packaging.',
        returnInstructions: 'Contact seller within 30 days to initiate return process.'
      };
      break;
  }

  return this.save();
};

// Method to get human-readable return policy details
ListingSchema.methods.getReturnPolicyDescription = function() {
  if (!this.returnPolicy || !this.returnPolicy.acceptsReturns) {
    return "No returns accepted.";
  }

  const defectPolicyText = {
    'full_refund': 'Full refund for defective items',
    'replacement': 'Replacement for defective items',
    'partial_refund': 'Partial refund for defective items',
    'repair': 'Repairs offered for defective items',
    'store_credit': 'Store credit for defective items',
    'no_returns': 'No returns for defective items'
  };

  const sizePolicyText = {
    'full_refund': 'Full refund for size/fit issues',
    'exchange_only': 'Exchange only for size/fit issues',
    'store_credit': 'Store credit for size/fit issues',
    'no_returns': 'No returns for size/fit issues'
  };

  return `
Return period: ${this.returnPolicy.returnPeriodDays} days
${defectPolicyText[this.returnPolicy.defectPolicy]}
${sizePolicyText[this.returnPolicy.sizeFitReturnPolicy]}
Return shipping paid by: ${this.returnPolicy.buyerPaysReturn ? 'Buyer' : 'Seller'}
${this.returnPolicy.additionalConditions ? `Additional conditions: ${this.returnPolicy.additionalConditions}` : ''}
  `.trim();
};

module.exports = mongoose.model('Listing', ListingSchema);
