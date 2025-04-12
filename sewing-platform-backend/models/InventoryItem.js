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

// Check if inventory is low
InventoryItemSchema.methods.isLowStock = function() {
  return this.stock <= this.threshold;
};

// Method to update stock
InventoryItemSchema.methods.updateStock = function(quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Cannot reduce stock below zero');
  }
  this.stock += quantity;
  return this.save();
};

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
