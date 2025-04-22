const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const uploadMiddleware = require('../middleware/upload');
const { checkRole } = require('../middleware/role');

router.get('/', (req, res) => {
  res.send('Auth route placeholder');
});

// @route    GET /api/users/wishlist
// @desc     Get current user's wishlist
// @access   Private
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'wishlist.listingId',
        select: 'title price photos status',
        match: { status: 'active' } // Only return active listings
      });
    
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }
    
    // Filter out any null listings (deactivated or deleted ones)
    const wishlist = user.wishlist.filter(item => item.listingId);
    
    res.json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    console.error('Error retrieving wishlist:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route    POST /api/users/wishlist
// @desc     Add item to wishlist
// @access   Private
router.post('/wishlist', [
  auth,
  [
    check('listingId', 'Listing ID is required').not().isEmpty(),
    check('notifyOnPriceChange', 'Notify flag must be boolean').optional().isBoolean()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { listingId, notifyOnPriceChange = false } = req.body;
    
    if (!listingId) {
      return res.status(400).json({ errors: [{ message: 'Listing ID is required' }] });
    }
    
    // Verify listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }
    
    // Check if already in wishlist
    const user = await User.findById(req.user.id);
    const existingItem = user.wishlist.find(
      item => item.listingId.toString() === listingId
    );
    
    if (existingItem) {
      // Update notification preference if it's already in wishlist
      existingItem.notifyOnPriceChange = notifyOnPriceChange;
      existingItem.initialPrice = listing.price; // Reset initial price for price drop notifications
    } else {
      // Add to wishlist
      user.wishlist.push({
        listingId,
        addedAt: new Date(),
        notifyOnPriceChange,
        initialPrice: listing.price
      });
    }
    
    await user.save();
    
    // Populate listing details for response
    const populatedUser = await User.findById(req.user.id)
      .populate({
        path: 'wishlist.listingId',
        select: 'title photos price category status sellerId customizable materials colors',
        populate: {
          path: 'sellerId',
          select: 'businessName rating'
        }
      });
    
    res.json({
      success: true,
      data: populatedUser.wishlist
    });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route    DELETE /api/users/wishlist/:listingId
// @desc     Remove item from wishlist
// @access   Private
router.delete('/wishlist/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    
    // Remove item from wishlist
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(
      item => item.listingId.toString() !== listingId
    );
    
    await user.save();
    
    // Populate listing details for response
    const populatedUser = await User.findById(req.user.id)
      .populate({
        path: 'wishlist.listingId',
        select: 'title photos price category status sellerId',
        populate: {
          path: 'sellerId',
          select: 'businessName'
        }
      });
    
    res.json({
      success: true,
      data: populatedUser.wishlist
    });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route    GET /api/users/saved-searches
// @desc     Get current user's saved searches
// @access   Private
router.get('/saved-searches', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('savedSearches');
    
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }
    
    res.json({
      success: true,
      data: user.savedSearches
    });
  } catch (err) {
    console.error('Error retrieving saved searches:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route    POST /api/users/saved-searches
// @desc     Save a search
// @access   Private
router.post('/saved-searches', [
  auth,
  [
    check('name', 'Search name is required').not().isEmpty(),
    check('query', 'Search query is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { name, query, emailNotifications } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Add new saved search
    user.savedSearches.push({
      name,
      query,
      createdAt: Date.now(),
      emailNotifications: emailNotifications || {
        enabled: false,
        frequency: 'never'
      }
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Search saved successfully',
      data: user.savedSearches[user.savedSearches.length - 1]
    });
  } catch (err) {
    console.error('Error saving search:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route    DELETE /api/users/saved-searches/:id
// @desc     Delete a saved search
// @access   Private
router.delete('/saved-searches/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if saved search exists
    const searchIndex = user.savedSearches.findIndex(
      search => search._id.toString() === req.params.id
    );
    
    if (searchIndex === -1) {
      return res.status(404).json({ 
        errors: [{ message: 'Saved search not found' }] 
      });
    }
    
    // Remove saved search
    user.savedSearches.splice(searchIndex, 1);
    await user.save();
    
    res.json({
      success: true,
      message: 'Saved search deleted'
    });
  } catch (err) {
    console.error('Error deleting saved search:', err);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ errors: [{ message: 'Invalid saved search ID' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/users/seller-profile
// @desc Get seller profile information
// @access Private (Seller only)
router.get('/seller-profile', [auth, checkRole('seller')], async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('businessName businessAddress businessDescription businessWebsite businessEstablishedYear sellerProfile');
    
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }
    
    // Get order and listing count for profile
    const orderCount = await Order.countDocuments({ sellerId: req.user.id });
    const listingCount = await Listing.countDocuments({ sellerId: req.user.id, status: 'active' });
    
    // Get rating information
    const ratingInfo = user.rating || { average: 0, count: 0 };
    
    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          orders: orderCount,
          listings: listingCount,
          rating: ratingInfo
        }
      }
    });
  } catch (err) {
    console.error('Error retrieving seller profile:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/users/seller-profile
// @desc Update seller profile information
// @access Private (Seller only)
router.put('/seller-profile', [
  auth,
  checkRole('seller'),
  uploadMiddleware.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'logoImage', maxCount: 1 },
    { name: 'portfolioImages', maxCount: 10 }
  ])
], async (req, res) => {
  try {
    const {
      businessName,
      businessDescription,
      businessWebsite,
      businessEstablishedYear,
      businessAddress,
      bio,
      expertiseLevel,
      specialties,
      languages,
      brandColor,
      socialLinks,
      availability,
      businessHours,
      productionCapacity,
      servicesOffered,
      certifications,
      policies
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }
    
    // Update business information
    if (businessName) user.businessName = businessName;
    if (businessDescription) user.businessDescription = businessDescription;
    if (businessWebsite) user.businessWebsite = businessWebsite;
    if (businessEstablishedYear) user.businessEstablishedYear = businessEstablishedYear;
    
    // Update business address if provided
    if (businessAddress) {
      user.businessAddress = {
        ...user.businessAddress,
        ...JSON.parse(businessAddress)
      };
    }
    
    // Initialize sellerProfile if it doesn't exist
    if (!user.sellerProfile) {
      user.sellerProfile = {};
    }
    
    // Update profile fields if provided
    if (bio) user.sellerProfile.bio = bio;
    if (expertiseLevel) user.sellerProfile.expertiseLevel = expertiseLevel;
    if (specialties) user.sellerProfile.specialties = JSON.parse(specialties);
    if (languages) user.sellerProfile.languages = JSON.parse(languages);
    if (brandColor) user.sellerProfile.brandColor = brandColor;
    
    // Update social links if provided
    if (socialLinks) {
      user.sellerProfile.socialLinks = {
        ...user.sellerProfile.socialLinks,
        ...JSON.parse(socialLinks)
      };
    }
    
    // Update availability and business hours
    if (availability) user.sellerProfile.availability = availability;
    if (businessHours) user.sellerProfile.businessHours = JSON.parse(businessHours);
    
    // Update production capacity
    if (productionCapacity) {
      user.sellerProfile.productionCapacity = {
        ...user.sellerProfile.productionCapacity,
        ...JSON.parse(productionCapacity)
      };
    }
    
    // Update services offered
    if (servicesOffered) user.sellerProfile.servicesOffered = JSON.parse(servicesOffered);
    
    // Update certifications
    if (certifications) user.sellerProfile.certifications = JSON.parse(certifications);
    
    // Update shop policies
    if (policies) {
      user.sellerProfile.policies = {
        ...user.sellerProfile.policies,
        ...JSON.parse(policies)
      };
    }
    
    // Handle file uploads
    if (req.files) {
      // Handle banner image
      if (req.files.bannerImage && req.files.bannerImage[0]) {
        user.sellerProfile.bannerImage = req.files.bannerImage[0].filename;
      }
      
      // Handle logo image
      if (req.files.logoImage && req.files.logoImage[0]) {
        user.sellerProfile.logoImage = req.files.logoImage[0].filename;
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Seller profile updated successfully',
      data: {
        businessName: user.businessName,
        businessDescription: user.businessDescription,
        businessWebsite: user.businessWebsite,
        businessEstablishedYear: user.businessEstablishedYear,
        businessAddress: user.businessAddress,
        sellerProfile: user.sellerProfile
      }
    });
  } catch (err) {
    console.error('Error updating seller profile:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/users/seller-profile/portfolio
// @desc Add a portfolio project
// @access Private (Seller only)
router.post('/seller-profile/portfolio', [
  auth,
  checkRole('seller'),
  uploadMiddleware.array('images', 5),
  [
    check('title', 'Project title is required').not().isEmpty(),
    check('description', 'Project description is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { title, description, year, featured } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }
    
    // Initialize sellerProfile if it doesn't exist
    if (!user.sellerProfile) {
      user.sellerProfile = {};
    }
    
    // Initialize portfolioProjects if it doesn't exist
    if (!user.sellerProfile.portfolioProjects) {
      user.sellerProfile.portfolioProjects = [];
    }
    
    // Get uploaded image filenames
    const images = req.files ? req.files.map(file => file.filename) : [];
    
    // Create new portfolio project
    const newProject = {
      title,
      description,
      images,
      year: year ? parseInt(year) : new Date().getFullYear(),
      featured: featured === 'true'
    };
    
    user.sellerProfile.portfolioProjects.push(newProject);
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Portfolio project added successfully',
      data: newProject
    });
  } catch (err) {
    console.error('Error adding portfolio project:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/users/seller-profile/portfolio/:id
// @desc Update a portfolio project
// @access Private (Seller only)
router.put('/seller-profile/portfolio/:id', [
  auth,
  checkRole('seller'),
  uploadMiddleware.array('newImages', 5)
], async (req, res) => {
  try {
    const { title, description, year, featured, removeImages } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }
    
    // Check if seller profile and portfolio exist
    if (!user.sellerProfile || !user.sellerProfile.portfolioProjects) {
      return res.status(404).json({ errors: [{ message: 'Portfolio not found' }] });
    }
    
    // Find project by ID
    const projectIndex = user.sellerProfile.portfolioProjects.findIndex(
      p => p._id.toString() === req.params.id
    );
    
    if (projectIndex === -1) {
      return res.status(404).json({ errors: [{ message: 'Project not found' }] });
    }
    
    const project = user.sellerProfile.portfolioProjects[projectIndex];
    
    // Update project fields if provided
    if (title) project.title = title;
    if (description) project.description = description;
    if (year) project.year = parseInt(year);
    if (featured !== undefined) project.featured = featured === 'true';
    
    // Handle image removals if specified
    if (removeImages) {
      const imagesToRemove = JSON.parse(removeImages);
      project.images = project.images.filter(img => !imagesToRemove.includes(img));
    }
    
    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      project.images = [...project.images, ...newImages];
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Portfolio project updated successfully',
      data: project
    });
  } catch (err) {
    console.error('Error updating portfolio project:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Project not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route DELETE /api/users/seller-profile/portfolio/:id
// @desc Delete a portfolio project
// @access Private (Seller only)
router.delete('/seller-profile/portfolio/:id', [auth, checkRole('seller')], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }
    
    // Check if seller profile and portfolio exist
    if (!user.sellerProfile || !user.sellerProfile.portfolioProjects) {
      return res.status(404).json({ errors: [{ message: 'Portfolio not found' }] });
    }
    
    // Find project by ID
    const projectIndex = user.sellerProfile.portfolioProjects.findIndex(
      p => p._id.toString() === req.params.id
    );
    
    if (projectIndex === -1) {
      return res.status(404).json({ errors: [{ message: 'Project not found' }] });
    }
    
    // Remove project
    user.sellerProfile.portfolioProjects.splice(projectIndex, 1);
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Portfolio project deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting portfolio project:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Project not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/users/seller-profile/contact
// @desc Update seller contact information
// @access Private (Seller only)
router.put('/seller-profile/contact', [
  auth,
  checkRole('seller'),
  [
    check('phone', 'Phone number is required').matches(/^\+?[1-9]\d{9,14}$/),
    check('contactEmail', 'Please include a valid email').optional().isEmail(),
    check('showEmail', 'Show email flag must be a boolean').optional().isBoolean(),
    check('address', 'Address must be an object').optional().isObject()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { 
      phone, 
      contactEmail, 
      showEmail, 
      address 
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'User not found' }] });
    }

    // Update contact information
    if (phone) user.phone = phone;
    if (contactEmail) user.contactEmail = contactEmail;
    
    // Initialize sellerProfile if it doesn't exist
    if (!user.sellerProfile) {
      user.sellerProfile = {};
    }
    
    // Initialize contact info if it doesn't exist
    if (!user.sellerProfile.contactInfo) {
      user.sellerProfile.contactInfo = {};
    }
    
    // Update contact visibility settings
    if (showEmail !== undefined) {
      user.privacySettings.showEmail = showEmail;
    }
    
    // Update address if provided
    if (address) {
      if (!user.businessAddress) {
        user.businessAddress = {};
      }
      
      user.businessAddress = {
        ...user.businessAddress,
        ...address
      };
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: {
        phone: user.phone,
        contactEmail: user.contactEmail || user.email,
        businessAddress: user.businessAddress,
        privacySettings: user.privacySettings
      }
    });
  } catch (err) {
    console.error('Error updating contact information:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/users/seller/:id/public-profile
// @desc Get a seller's public profile
// @access Public
router.get('/seller/:id/public-profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('businessName businessDescription businessWebsite businessEstablishedYear sellerProfile rating createdAt phone email contactEmail businessAddress privacySettings');
    
    if (!user) {
      return res.status(404).json({ errors: [{ message: 'Seller not found' }] });
    }
    
    if (user.role !== 'seller') {
      return res.status(400).json({ errors: [{ message: 'User is not a seller' }] });
    }
    
    // Get active listings
    const listings = await Listing.find({ 
      sellerId: req.params.id,
      status: 'active'
    })
    .select('_id title price photos category createdAt')
    .sort({ createdAt: -1 })
    .limit(6);
    
    // Get order count
    const orderCount = await Order.countDocuments({ 
      sellerId: req.params.id,
      status: { $in: ['completed', 'delivered'] }
    });
    
    // Get recent reviews
    const reviews = await Order.find({
      sellerId: req.params.id,
      'rating.value': { $exists: true }
    })
    .select('rating createdAt')
    .populate('buyerId', 'name')
    .sort({ 'rating.timestamp': -1 })
    .limit(5);
    
    // Prepare seller data with contact info based on privacy settings
    const sellerData = {
      ...user.toObject(),
      email: user.privacySettings?.showEmail ? (user.contactEmail || user.email) : undefined,
      phone: user.phone
    };
    
    // Remove sensitive fields
    delete sellerData.privacySettings;
    
    res.json({
      success: true,
      data: {
        seller: sellerData,
        stats: {
          orderCount,
          listingCount: await Listing.countDocuments({ sellerId: req.params.id, status: 'active' }),
          memberSince: user.createdAt
        },
        featuredListings: listings,
        recentReviews: reviews
      }
    });
  } catch (err) {
    console.error('Error retrieving seller profile:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Seller not found' }] });
    }
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route   PUT /api/users/wishlist/:listingId/notify
// @desc    Toggle price drop notification for wishlist item
// @access  Private
router.put('/wishlist/:listingId/notify', [
  auth,
  [
    check('notify', 'Notify parameter must be a boolean').isBoolean()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { listingId } = req.params;
    const { notify } = req.body;
    
    const user = await User.findById(req.user.id);
    const wishlistItem = user.wishlist.find(
      item => item.listingId.toString() === listingId
    );
    
    if (!wishlistItem) {
      return res.status(404).json({ 
        errors: [{ message: 'Item not found in wishlist' }] 
      });
    }
    
    // Update notification preference
    wishlistItem.notifyOnPriceChange = notify;
    
    // If enabling notifications, reset the initial price
    if (notify) {
      const listing = await Listing.findById(listingId);
      if (listing) {
        wishlistItem.initialPrice = listing.price;
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        listingId,
        notifyOnPriceChange: wishlistItem.notifyOnPriceChange,
        initialPrice: wishlistItem.initialPrice
      }
    });
  } catch (err) {
    console.error('Update wishlist notification error:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router;
