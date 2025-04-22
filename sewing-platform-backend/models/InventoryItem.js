const mongoose = require('mongoose');
const { Schema } = mongoose;

const InventoryItemSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative']
  },
  threshold: {
    type: Number,
    default: 5,
    min: [0, 'Threshold cannot be negative']
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
    index: true
  },
  photo: {
    type: String,
    default: 'default-inventory.jpg'
  },
  unit: {
    type: String,
    default: 'piece'
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  tags: [{
    type: String,
    trim: true
  }],
  active: {
    type: Boolean,
    default: true
  },
  // Enhanced inventory tracking
  stockHistory: [{
    action: {
      type: String,
      enum: ['initial', 'add', 'remove', 'adjustment', 'order', 'return'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reference: {
      type: String
    },
    notes: String,
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  // Automatic reordering settings
  reorderPoint: {
    type: Number,
    default: 5,
    min: 0
  },
  reorderQuantity: {
    type: Number,
    default: 20,
    min: 0
  },
  autoReorderEnabled: {
    type: Boolean,
    default: false
  },
  lastReorderDate: Date,
  // Supplier information
  supplier: {
    name: String,
    contactName: String,
    email: String,
    phone: String,
    website: String,
    leadTime: Number // Days until delivery
  },
  // Additional properties for better organization
  category: {
    type: String,
    trim: true,
    index: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  location: {
    shelf: String,
    bin: String,
    warehouse: String,
    notes: String
  },
  // Material properties
  material: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'kg', 'oz', 'lb']
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'm', 'ft']
    }
  },
  // Usage statistics
  usage: {
    totalConsumed: {
      type: Number,
      default: 0
    },
    lastUsedDate: Date,
    averageMonthlyUsage: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for related listings
InventoryItemSchema.virtual('listings', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'inventoryItems.itemId'
});

// Add index for low stock queries
InventoryItemSchema.index({ stock: 1, threshold: 1 });
InventoryItemSchema.index({ sellerId: 1, category: 1 });

// Check if inventory is low stock
InventoryItemSchema.methods.isLowStock = function() {
  return this.stock <= this.threshold;
};

// Enhanced method to update stock with history tracking
InventoryItemSchema.methods.updateStock = async function(quantity, action, options = {}) {
  const { notes, reference, performedBy, orderId } = options;
  
  if (this.stock + quantity < 0) {
    throw new Error('Cannot reduce stock below zero');
  }
  
  // Create history record
  this.stockHistory.push({
    action: action || (quantity >= 0 ? 'add' : 'remove'),
    quantity: Math.abs(quantity),
    date: Date.now(),
    notes: notes || '',
    reference: reference || '',
    performedBy: performedBy,
    orderId: orderId
  });
  
  // Update stock
  this.stock += quantity;
  
  // Update usage statistics
  if (quantity < 0) {
    this.usage.totalConsumed += Math.abs(quantity);
    this.usage.lastUsedDate = Date.now();
  }
  
  // Check if we should send low stock notification
  const needsLowStockAlert = this.stock <= this.threshold && this.stock > 0;
  
  // Check if we should send out of stock notification
  const needsOutOfStockAlert = this.stock === 0;
  
  // Save the inventory item
  await this.save();
  
  // Return notification flags
  return {
    needsLowStockAlert,
    needsOutOfStockAlert
  };
};

// Check if item needs reordering
InventoryItemSchema.methods.needsReordering = function() {
  if (!this.autoReorderEnabled) return false;
  
  // Check if stock is below reorder point
  if (this.stock > this.reorderPoint) return false;
  
  // Check if we've already reordered recently (within 7 days)
  if (this.lastReorderDate) {
    const daysSinceLastReorder = (Date.now() - this.lastReorderDate) / (1000 * 60 * 60 * 24);
    if (daysSinceLastReorder < 7) return false;
  }
  
  return true;
};

// Calculate inventory value
InventoryItemSchema.methods.calculateValue = function() {
  return this.stock * (this.cost || 0);
};

// Calculate days until stockout based on average usage
InventoryItemSchema.methods.calculateDaysUntilStockout = function() {
  if (!this.usage.averageMonthlyUsage || this.usage.averageMonthlyUsage === 0) return null;
  
  const dailyUsage = this.usage.averageMonthlyUsage / 30;
  return Math.floor(this.stock / dailyUsage);
};

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
