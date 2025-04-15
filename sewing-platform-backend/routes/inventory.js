const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const InventoryItem = require('../models/InventoryItem');
const uploadMiddleware = require('../middleware/upload');

// @route GET /api/inventory
// @desc  Get sellers inventory
// @access Private (Seller only)
router.get('/', auth, checkRole('seller'), async(req, res) => {
  try {
    const inventoryItems = await InventoryItem.find({ sellerId: req.user.id }).sort({ createdAt: -1 });

    res.json(inventoryItems);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
})

// @route GET /api/inventory/:id
// @desc  Get inventory item by id
// @access Private (Owner only)
router.get('/:id', auth, async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.find(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }

    // check if user owns the inventory item
    if (inventoryItem.sellerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ errors: [{ message: 'Not authorized' }] });
    }

    res.json(inventoryItem);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'objectId') {
      return res.status(404).json({ errors: [{ message: 'Inventory item not found' }] });
    }
    res.status(500).send('Server error');
  }
});

// @route POST /api/inventory
// @desc  Create new inventory item
// @access private

