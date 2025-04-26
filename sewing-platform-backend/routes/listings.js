const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const Listing = require('../models/Listing');
const User = require('../models/User');
const uploadMiddleware = require('../middleware/upload');
const cloudStorage = require('../utils/cloudStorage');
const fs = require('fs');
const path = require('path');

// @route   GET /api/listings
// @desc    Get all listings (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      customizable,
      sellerId,
      search,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { status: 'active' }; // Only show active listings

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (customizable !== undefined) {
      filter.customizable = customizable === 'true';
    }

    if (sellerId) {
      filter.sellerId = sellerId;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        default:
          sortOption = { createdAt: -1 }; // Default to newest
      }
    } else {
      sortOption = { createdAt: -1 }; // Default to newest
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Count total documents for pagination info
    const total = await Listing.countDocuments(filter);

    // Execute query with populate
    const listings = await Listing.find(filter)
      .populate('sellerId', 'businessName rating')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Return listings with pagination info
    res.json({
      success: true,
      data: listings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   GET /api/listings/seller
// @desc    Get all listings for the current seller
// @access  Private (seller only)
router.get('/seller', [auth, checkRole('seller')], async (req, res) => {
  try {
    const listings = await Listing.find({ sellerId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: listings
    });
  } catch (err) {
    console.error('Error fetching seller listings:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   GET /api/listings/:id
// @desc    Get a listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('sellerId', 'businessName rating businessDescription businessAddress sellerProfile');

    if (!listing) {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }

    // If listing is not active, only allow seller to view it
    if (listing.status !== 'active') {
      // Check if user is authenticated and is the seller
      if (!req.user || req.user.id !== listing.sellerId._id.toString()) {
        return res.status(403).json({ errors: [{ message: 'Access denied' }] });
      }
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (err) {
    console.error('Error fetching listing:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private (seller only)
router.post('/', [
  auth,
  checkRole('seller'),
  uploadMiddleware.array('photos', 10), // Allow up to 10 photos
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isFloat({ min: 0 }),
    check('category', 'Category is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      price,
      category,
      status = 'draft',
      customizable = false,
      stock = 0,
      colors,
      sizes,
      materials
    } = req.body;

    // Create new listing
    const newListing = new Listing({
      sellerId: req.user.id,
      title,
      description,
      price: parseFloat(price),
      category,
      status,
      customizable: customizable === 'true',
      stock: parseInt(stock) || 0,
      colors: colors ? JSON.parse(colors) : [],
      sizes: sizes ? JSON.parse(sizes) : [],
      materials: materials ? JSON.parse(materials) : []
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const photoFileNames = [];
      
      // Process each uploaded file
      for (const file of req.files) {
        try {
          // For cloud storage (like Azure Blob)
          if (process.env.USE_CLOUD_STORAGE === 'true') {
            const blobName = `products/${req.user.id}/${Date.now()}-${file.originalname}`;
            await cloudStorage.uploadFile(file.path, blobName);
            photoFileNames.push(blobName);
          } else {
            // For local storage
            photoFileNames.push(file.filename);
          }
        } catch (uploadErr) {
          console.error('Error uploading file:', uploadErr);
          // Continue with other files even if one fails
        }
      }

      newListing.photos = photoFileNames;
    }

    await newListing.save();

    // Return the newly created listing
    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: newListing
    });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private (seller only)
router.put('/:id', [
  auth,
  checkRole('seller'),
  uploadMiddleware.array('photos', 10), // Allow up to 10 photos
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty(),
    check('price', 'Price must be a number').optional().isFloat({ min: 0 }),
    check('category', 'Category is required').optional().not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find the listing
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }

    // Check if user is the owner of the listing
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Access denied' }] });
    }

    // Update fields
    const updateFields = {};
    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.description) updateFields.description = req.body.description;
    if (req.body.price) updateFields.price = parseFloat(req.body.price);
    if (req.body.category) updateFields.category = req.body.category;
    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.customizable !== undefined) updateFields.customizable = req.body.customizable === 'true';
    if (req.body.stock !== undefined) updateFields.stock = parseInt(req.body.stock) || 0;
    if (req.body.colors) updateFields.colors = JSON.parse(req.body.colors);
    if (req.body.sizes) updateFields.sizes = JSON.parse(req.body.sizes);
    if (req.body.materials) updateFields.materials = JSON.parse(req.body.materials);

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const photoFileNames = [];

      // Process each uploaded file
      for (const file of req.files) {
        try {
          // For cloud storage (like Azure Blob)
          if (process.env.USE_CLOUD_STORAGE === 'true') {
            const blobName = `products/${req.user.id}/${Date.now()}-${file.originalname}`;
            await cloudStorage.uploadFile(file.path, blobName);
            photoFileNames.push(blobName);
          } else {
            // For local storage
            photoFileNames.push(file.filename);
          }
        } catch (uploadErr) {
          console.error('Error uploading file:', uploadErr);
          // Continue with other files even if one fails
        }
      }

      // If there are existing photos and the removeExistingPhotos flag is not set, 
      // we append the new photos to the existing ones
      if (!req.body.removeExistingPhotos) {
        updateFields.photos = [...(listing.photos || []), ...photoFileNames];
      } else {
        updateFields.photos = photoFileNames;
      }
    }

    // Update listing
    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (err) {
    console.error('Error updating listing:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private (seller only)
router.delete('/:id', [auth, checkRole('seller')], async (req, res) => {
  try {
    // Find the listing
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }

    // Check if user is the owner of the listing
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Access denied' }] });
    }

    // Delete photos from storage if they exist
    if (listing.photos && listing.photos.length > 0) {
      if (process.env.USE_CLOUD_STORAGE === 'true') {
        // Delete from cloud storage
        for (const photoName of listing.photos) {
          try {
            await cloudStorage.deleteFile(photoName);
          } catch (deleteErr) {
            console.error('Error deleting file from cloud storage:', deleteErr);
          }
        }
      } else {
        // Delete from local storage
        for (const photoName of listing.photos) {
          try {
            const photoPath = path.join(__dirname, '..', 'uploads', photoName);
            if (fs.existsSync(photoPath)) {
              fs.unlinkSync(photoPath);
            }
          } catch (deleteErr) {
            console.error('Error deleting file from local storage:', deleteErr);
          }
        }
      }
    }

    // Delete the listing
    await Listing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting listing:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   PATCH /api/listings/:id/status
// @desc    Update listing status
// @access  Private (seller only)
router.patch('/:id/status', [
  auth,
  checkRole('seller'),
  [
    check('status', 'Status is required').isIn(['active', 'draft', 'archived'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find the listing
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }

    // Check if user is the owner of the listing
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Access denied' }] });
    }

    // Update listing status
    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Listing status updated successfully',
      data: listing
    });
  } catch (err) {
    console.error('Error updating listing status:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   POST /api/listings/:id/duplicate
// @desc    Duplicate a listing
// @access  Private (seller only)
router.post('/:id/duplicate', [auth, checkRole('seller')], async (req, res) => {
  try {
    // Find the listing to duplicate
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }

    // Check if user is the owner of the listing
    if (listing.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Access denied' }] });
    }

    // Create a new listing based on the original
    const newListing = new Listing({
      sellerId: req.user.id,
      title: `${listing.title} (Copy)`,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      status: 'draft', // Always start as draft
      customizable: listing.customizable,
      stock: listing.stock,
      colors: listing.colors,
      sizes: listing.sizes,
      materials: listing.materials,
      photos: listing.photos // Reference the same photos
    });

    await newListing.save();

    res.status(201).json({
      success: true,
      message: 'Listing duplicated successfully',
      data: newListing
    });
  } catch (err) {
    console.error('Error duplicating listing:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   GET /api/listings/seller/:id
// @desc    Get all active listings for a specific seller
// @access  Public
router.get('/seller/:id', async (req, res) => {
  try {
    // Check if seller exists
    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ errors: [{ message: 'Seller not found' }] });
    }

    // Find active listings for this seller
    const listings = await Listing.find({
      sellerId: req.params.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: listings
    });
  } catch (err) {
    console.error('Error fetching seller listings:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Seller not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   GET /api/listings/categories
// @desc    Get all unique categories
// @access  Public
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Listing.distinct('category', { status: 'active' });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router;
