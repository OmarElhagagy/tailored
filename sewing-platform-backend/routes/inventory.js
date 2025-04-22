const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const InventoryItem = require('../models/InventoryItem');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const uploadMiddleware = require('../middleware/upload');

// @route GET /api/inventory
// @desc Get all inventory items for a seller
// @access Private (Seller only)
router.get('/', [auth, checkRole('seller')], async (req, res) => {
  try {
    const { 
      search, 
      category, 
      sortBy = 'createdAt', 
      sortDir = 'desc',
      lowStock = false,
      page = 1,
      limit = 20
    } = req.query;
    
    let query = { sellerId: req.user.id };
    
    // Apply filters if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock === 'true') {
      query.stock = { $lt: 10 }; // Define low stock as less than 10 items
    }
    
    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting setup
    const sortOptions = {};
    sortOptions[sortBy] = sortDir === 'asc' ? 1 : -1;
    
    // Execute query with pagination and sorting
    const items = await InventoryItem.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await InventoryItem.countDocuments(query);
    
    // Get category stats for filters
    const categories = await InventoryItem.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get stock level summary
    const stockSummary = await InventoryItem.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        lowStockItems: { $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] } },
        outOfStockItems: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } }
      }}
    ]);
    
    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        categories,
        stockSummary: stockSummary.length > 0 ? stockSummary[0] : {
          totalItems: 0,
          totalValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0
        }
      }
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/inventory/:id
// @desc Get a single inventory item
// @access Private (Seller only)
router.get('/:id', [auth, checkRole('seller')], async (req, res) => {
  try {
    const item = await InventoryItem.findOne({ 
      _id: req.params.id,
      sellerId: req.user.id
    });
    
    if (!item) {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    
    // Get listings using this inventory item
    const listings = await Listing.find({
      'inventoryItems.itemId': item._id
    }).select('_id title status');
    
    // Calculate usage and movement data
    const usage = {
      totalListings: listings.length,
      activeListings: listings.filter(l => l.status === 'active').length,
      lastUpdated: item.updatedAt
    };
    
    res.json({
      success: true,
      data: {
        item,
        usage,
        listings
      }
    });
  } catch (err) {
    console.error('Error fetching inventory item:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/inventory
// @desc Create a new inventory item
// @access Private (Seller only)
router.post('/', [
  auth,
  checkRole('seller'),
  uploadMiddleware.single('photo'),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('stock', 'Stock must be a number').isNumeric(),
    check('price', 'Price must be a number').isNumeric(),
    check('unit', 'Unit of measurement is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      name,
      description,
      stock,
      price,
      unit,
      category,
      material,
      color,
      weight,
      dimensions,
      supplier,
      sku,
      reorderPoint,
      reorderQuantity,
      location
    } = req.body;
    
    // Check if item with same SKU already exists
    if (sku) {
      const existingItem = await InventoryItem.findOne({ 
        sellerId: req.user.id,
        sku
      });
      
      if (existingItem) {
        return res.status(400).json({ 
          errors: [{ message: 'An item with this SKU already exists' }]
        });
      }
    }
    
    const newItem = new InventoryItem({
      sellerId: req.user.id,
      name,
      description,
      stock,
      price,
      unit,
      category,
      material,
      color,
      weight,
      dimensions,
      supplier,
      sku,
      reorderPoint: reorderPoint || 5, // Default reorder point
      reorderQuantity: reorderQuantity || 20, // Default reorder quantity
      location,
      stockHistory: [{
        action: 'initial',
        quantity: stock,
        date: Date.now(),
        notes: 'Initial inventory'
      }]
    });
    
    const item = await newItem.save();
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/inventory/:id
// @desc Update an inventory item
// @access Private (Seller only)
router.put('/:id', [
  auth,
  checkRole('seller'),
  uploadMiddleware.single('photo'),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('stock', 'Stock must be a number').isNumeric(),
    check('price', 'Price must be a number').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const item = await InventoryItem.findOne({
      _id: req.params.id,
      sellerId: req.user.id
    });
    
    if (!item) {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    
    const {
      name,
      description,
      stock,
      price,
      unit,
      category,
      material,
      color,
      weight,
      dimensions,
      supplier,
      sku,
      reorderPoint,
      reorderQuantity,
      location,
      notes
    } = req.body;
    
    // Check if stock has changed to track history
    if (stock !== item.stock) {
      const stockChange = stock - item.stock;
      const action = stockChange > 0 ? 'add' : 'remove';
      
      item.stockHistory.push({
        action,
        quantity: Math.abs(stockChange),
        date: Date.now(),
        notes: notes || `Manual ${action} by user`
      });
      
      // Check if we need to create low stock notification
      if (stock <= (reorderPoint || item.reorderPoint) && item.stock > (reorderPoint || item.reorderPoint)) {
        const notification = new Notification({
          userId: req.user.id,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${name} is low on stock (${stock} remaining). Consider reordering.`,
          relatedId: item._id,
          relatedType: 'InventoryItem'
        });
        
        await notification.save();
      }
    }
    
    // Update the item with new values
    item.name = name;
    item.description = description;
    item.stock = stock;
    item.price = price;
    if (unit) item.unit = unit;
    if (category) item.category = category;
    if (material) item.material = material;
    if (color) item.color = color;
    if (weight) item.weight = weight;
    if (dimensions) item.dimensions = dimensions;
    if (supplier) item.supplier = supplier;
    if (sku) item.sku = sku;
    if (reorderPoint) item.reorderPoint = reorderPoint;
    if (reorderQuantity) item.reorderQuantity = reorderQuantity;
    if (location) item.location = location;
    
    const updatedItem = await item.save();
    
    res.json({
      success: true,
      data: updatedItem
    });
  } catch (err) {
    console.error('Error updating inventory item:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/inventory/:id/adjust
// @desc Adjust inventory stock (add or remove)
// @access Private (Seller only)
router.post('/:id/adjust', [
  auth,
  checkRole('seller'),
  [
    check('action', 'Action must be add or remove').isIn(['add', 'remove']),
    check('quantity', 'Quantity must be a positive number').isInt({ min: 1 }),
    check('notes', 'Notes are required for stock adjustments').optional()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { action, quantity, notes } = req.body;
    
    const item = await InventoryItem.findOne({
      _id: req.params.id,
      sellerId: req.user.id
    });
    
    if (!item) {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    
    // Calculate new stock level
    let newStock;
    if (action === 'add') {
      newStock = item.stock + quantity;
    } else {
      // Check if we have enough stock
      if (item.stock < quantity) {
        return res.status(400).json({ 
          errors: [{ message: 'Not enough stock available for removal' }]
        });
      }
      newStock = item.stock - quantity;
    }
    
    // Update stock history
    item.stockHistory.push({
      action,
      quantity,
      date: Date.now(),
      notes: notes || `Manual ${action} by user`
    });
    
    // Update stock level
    item.stock = newStock;
    
    // Check if we need to create low stock notification
    if (newStock <= item.reorderPoint && item.stock > item.reorderPoint) {
      const notification = new Notification({
        userId: req.user.id,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${item.name} is low on stock (${newStock} remaining). Consider reordering.`,
        relatedId: item._id,
        relatedType: 'InventoryItem'
      });
      
      await notification.save();
    }
    
    const updatedItem = await item.save();
    
    res.json({
      success: true,
      data: updatedItem
    });
  } catch (err) {
    console.error('Error adjusting inventory:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route DELETE /api/inventory/:id
// @desc Delete an inventory item
// @access Private (Seller only)
router.delete('/:id', [auth, checkRole('seller')], async (req, res) => {
  try {
    // Check if this inventory item is used in any listings
    const listings = await Listing.find({
      'inventoryItems.itemId': req.params.id
    });
    
    if (listings.length > 0) {
      return res.status(400).json({ 
        errors: [{ 
          message: 'This inventory item is used in listings and cannot be deleted',
          listings: listings.map(l => ({ id: l._id, title: l.title }))
        }]
      });
    }
    
    const item = await InventoryItem.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.user.id
    });
    
    if (!item) {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    
    res.json({
      success: true,
      message: 'Inventory item deleted'
    });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/inventory/stats
// @desc Get inventory statistics
// @access Private (Seller only)
router.get('/stats/overview', [auth, checkRole('seller')], async (req, res) => {
  try {
    // Get inventory overview stats
    const stats = await InventoryItem.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        totalStock: { $sum: '$stock' },
        lowStockItems: { $sum: { $cond: [{ $lte: ['$stock', '$reorderPoint'] }, 1, 0] } },
        outOfStockItems: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
        avgPrice: { $avg: '$price' }
      }}
    ]);
    
    // Get category breakdown
    const categoryBreakdown = await InventoryItem.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        averagePrice: { $avg: '$price' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Get stock movement trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const items = await InventoryItem.find({ 
      sellerId: req.user.id,
      'stockHistory.date': { $gte: thirtyDaysAgo }
    });
    
    // Process stock movements
    const stockMovements = {
      additions: 0,
      removals: 0,
      timeline: {}
    };
    
    items.forEach(item => {
      const recentHistory = item.stockHistory.filter(h => 
        new Date(h.date) >= thirtyDaysAgo
      );
      
      recentHistory.forEach(history => {
        // Aggregate total additions and removals
        if (history.action === 'add' || history.action === 'initial') {
          stockMovements.additions += history.quantity;
        } else if (history.action === 'remove') {
          stockMovements.removals += history.quantity;
        }
        
        // Aggregate day by day for timeline
        const dateStr = new Date(history.date).toISOString().split('T')[0];
        
        if (!stockMovements.timeline[dateStr]) {
          stockMovements.timeline[dateStr] = {
            additions: 0,
            removals: 0,
            net: 0
          };
        }
        
        if (history.action === 'add' || history.action === 'initial') {
          stockMovements.timeline[dateStr].additions += history.quantity;
          stockMovements.timeline[dateStr].net += history.quantity;
        } else if (history.action === 'remove') {
          stockMovements.timeline[dateStr].removals += history.quantity;
          stockMovements.timeline[dateStr].net -= history.quantity;
        }
      });
    });
    
    // Convert timeline to array for easier frontend processing
    const timelineArray = Object.keys(stockMovements.timeline).map(date => ({
      date,
      ...stockMovements.timeline[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    stockMovements.timeline = timelineArray;
    
    res.json({
      success: true,
      data: {
        overview: stats.length > 0 ? stats[0] : {
          totalItems: 0,
          totalValue: 0,
          totalStock: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          avgPrice: 0
        },
        categoryBreakdown,
        stockMovements
      }
    });
  } catch (err) {
    console.error('Error fetching inventory stats:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router;
