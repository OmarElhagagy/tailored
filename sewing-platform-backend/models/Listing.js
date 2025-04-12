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
      default: 'g'
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
  { title: 'text', description: 'text', tags: 'text' },
  { name: 'listing_text_index', weights: { title: 10, description: 5, tags: 3 } }
);

// Compound index for filtering by category and price
ListingSchema.index({ category: 1, price: 1 });

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

module.exports = mongoose.model('Listing', ListingSchema);
