const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Review = require('../models/Review');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const appInsights = require('../utils/appInsights');

// @route POST /api/reviews
// @desc Create a new review for a listing or seller
// @access Private (authenticated users only)
router.post('/', [
  auth,
  [
    check('itemId', 'Item ID is required').isMongoId(),
    check('itemType', 'Item type is required').isIn(['listing', 'seller']),
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('content', 'Review content is required').trim().notEmpty(),
    check('title').optional().trim().isLength({ max: 100 }),
    check('orderId', 'Order ID must be a valid MongoDB ID').optional().isMongoId(),
    check('aspects').optional().isArray(),
    check('aspects.*.name', 'Aspect name is required').optional().notEmpty(),
    check('aspects.*.rating', 'Aspect rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 })
  ]
], async (req, res) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    // Extract review data from request
    const { 
      itemId, 
      itemType, 
      rating, 
      content, 
      title, 
      aspects, 
      orderId 
    } = req.body;
    
    // Verify the item exists
    let itemExists = false;
    let isVerifiedPurchase = false;
    
    if (itemType === 'listing') {
      // Check if listing exists
      const listing = await Listing.findById(itemId);
      if (!listing) {
        return res.status(404).json({ 
          success: false, 
          errors: [{ message: 'Listing not found' }] 
        });
      }
      itemExists = true;
      
      // Prevent sellers from reviewing their own listings
      if (listing.sellerId.toString() === req.user.id) {
        return res.status(403).json({ 
          success: false, 
          errors: [{ message: 'You cannot review your own listing' }] 
        });
      }
      
      // Check if user has purchased this listing (verified purchase)
      if (orderId) {
        const order = await Order.findOne({ 
          _id: orderId,
          listingId: itemId,
          buyerId: req.user.id,
          status: { $in: ['delivered', 'completed'] }
        });
        
        isVerifiedPurchase = !!order;
      } else {
        // Without orderId, check if any completed order exists
        const order = await Order.findOne({
          listingId: itemId,
          buyerId: req.user.id,
          status: { $in: ['delivered', 'completed'] }
        });
        
        isVerifiedPurchase = !!order;
      }
    } else if (itemType === 'seller') {
      // Check if seller exists
      const seller = await User.findOne({ _id: itemId, role: 'seller' });
      if (!seller) {
        return res.status(404).json({ 
          success: false, 
          errors: [{ message: 'Seller not found' }] 
        });
      }
      itemExists = true;
      
      // Prevent users from reviewing themselves
      if (seller._id.toString() === req.user.id) {
        return res.status(403).json({ 
          success: false, 
          errors: [{ message: 'You cannot review yourself' }] 
        });
      }
      
      // Check if user has purchased from this seller (verified purchase)
      if (orderId) {
        const order = await Order.findOne({ 
          _id: orderId,
          sellerId: itemId,
          buyerId: req.user.id,
          status: { $in: ['delivered', 'completed'] }
        });
        
        isVerifiedPurchase = !!order;
      } else {
        // Without orderId, check if any completed order exists
        const order = await Order.findOne({
          sellerId: itemId,
          buyerId: req.user.id,
          status: { $in: ['delivered', 'completed'] }
        });
        
        isVerifiedPurchase = !!order;
      }
    }
    
    if (!itemExists) {
      return res.status(404).json({ 
        success: false, 
        errors: [{ message: 'Item not found' }] 
      });
    }
    
    // Check if user has already reviewed this item
    const existingReview = await Review.findOne({
      userId: req.user.id,
      itemId,
      itemType
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        errors: [{ message: 'You have already reviewed this item' }]
      });
    }
    
    // Create new review
    const newReview = new Review({
      userId: req.user.id,
      itemId,
      itemType,
      rating,
      content,
      title,
      aspects,
      orderId,
      verified: isVerifiedPurchase,
      status: isVerifiedPurchase ? 'published' : 'pending' // Auto-publish verified purchase reviews
    });
    
    await newReview.save();
    
    // Update average rating for the item
    const avgRating = await Review.calculateAverageRating(itemId, itemType);
    
    // Update the item's rating
    if (itemType === 'listing') {
      await Listing.findByIdAndUpdate(itemId, {
        $set: { 'rating': avgRating }
      });
    } else if (itemType === 'seller') {
      await User.findByIdAndUpdate(itemId, {
        $set: { 'rating': avgRating }
      });
    }
    
    // Track the event with App Insights
    appInsights.trackEvent('ReviewCreated', {
      userId: req.user.id,
      itemId,
      itemType,
      rating,
      isVerified: isVerifiedPurchase
    });
    
    res.status(201).json({
      success: true,
      data: {
        review: {
          _id: newReview._id,
          rating: newReview.rating,
          content: newReview.content,
          title: newReview.title,
          aspects: newReview.aspects,
          verified: newReview.verified,
          status: newReview.status,
          createdAt: newReview.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    appInsights.trackException(error, { component: 'ReviewsAPI', operation: 'create' });
    res.status(500).json({ 
      success: false, 
      errors: [{ message: 'Server error' }]
    });
  }
});

// @route GET /api/reviews/item/:itemType/:itemId
// @desc Get reviews for a specific item (listing or seller)
// @access Public
router.get('/item/:itemType/:itemId', [
  check('itemType', 'Item type must be either listing or seller').isIn(['listing', 'seller']),
  check('itemId', 'Item ID must be a valid MongoDB ID').isMongoId()
], async (req, res) => {
  try {
    // Validate request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { itemType, itemId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'recent'; // 'recent', 'helpful', 'highest', 'lowest'
    const filter = req.query.filter || 'all'; // 'all', 'verified', 'withImages'
    
    // Build the query
    const query = {
      itemId,
      itemType,
      status: 'published'
    };
    
    // Apply filters
    if (filter === 'verified') {
      query.verified = true;
    } else if (filter === 'withImages') {
      query.images = { $exists: true, $ne: [] };
    }
    
    // Build the sort options
    let sortOptions = {};
    
    switch (sort) {
      case 'helpful':
        sortOptions = { 'helpfulVotes.count': -1, createdAt: -1 };
        break;
      case 'highest':
        sortOptions = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortOptions = { rating: 1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Get reviews with pagination
    const reviews = await Review.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName profileImage')
      .select('-moderation -__v -helpfulVotes.users');
    
    // Get total count for pagination
    const total = await Review.countDocuments(query);
    
    // Calculate review statistics
    const stats = await Review.aggregate([
      { $match: { itemId: mongoose.Types.ObjectId(itemId), itemType, status: 'published' } },
      { $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }},
      { $sort: { _id: -1 } }
    ]);
    
    // Format the statistics
    const ratingStats = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    stats.forEach(stat => {
      ratingStats[stat._id] = stat.count;
    });
    
    // Get average rating
    const avgRating = await Review.calculateAverageRating(itemId, itemType);
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          average: avgRating.average,
          total: avgRating.count,
          distribution: ratingStats
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    appInsights.trackException(error, { component: 'ReviewsAPI', operation: 'getItemReviews' });
    res.status(500).json({ 
      success: false, 
      errors: [{ message: 'Server error' }]
    });
  }
});

// @route GET /api/reviews/user
// @desc Get reviews created by the authenticated user
// @access Private
router.get('/user', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get reviews created by the user
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('itemId', 'title mainPhoto name businessName')
      .select('-moderation -__v -helpfulVotes.users');
    
    // Get total count
    const total = await Review.countDocuments({ userId: req.user.id });
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    appInsights.trackException(error, { component: 'ReviewsAPI', operation: 'getUserReviews' });
    res.status(500).json({ 
      success: false, 
      errors: [{ message: 'Server error' }]
    });
  }
});

// @route PUT /api/reviews/:id
// @desc Update a review
// @access Private (review author only)
router.put('/:id', [
  auth,
  [
    check('id', 'Review ID must be a valid MongoDB ID').isMongoId(),
    check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
    check('content', 'Review content is required').optional().trim().notEmpty(),
    check('title').optional().trim().isLength({ max: 100 }),
    check('aspects').optional().isArray(),
    check('aspects.*.name', 'Aspect name is required').optional().notEmpty(),
    check('aspects.*.rating', 'Aspect rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 })
  ]
], async (req, res) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        errors: [{ message: 'Review not found' }] 
      });
    }
    
    // Check if the user is the author of the review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        errors: [{ message: 'Not authorized to update this review' }] 
      });
    }
    
    // Update review fields
    const updateData = {};
    
    if (req.body.rating !== undefined) updateData.rating = req.body.rating;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.aspects !== undefined) updateData.aspects = req.body.aspects;
    
    // If the review was rejected, set it back to pending when updated
    if (review.status === 'rejected') {
      updateData.status = 'pending';
    }
    
    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-moderation -__v -helpfulVotes.users');
    
    // Recalculate average rating for the item
    const avgRating = await Review.calculateAverageRating(review.itemId, review.itemType);
    
    // Update the item's rating
    if (review.itemType === 'listing') {
      await Listing.findByIdAndUpdate(review.itemId, {
        $set: { 'rating': avgRating }
      });
    } else if (review.itemType === 'seller') {
      await User.findByIdAndUpdate(review.itemId, {
        $set: { 'rating': avgRating }
      });
    }
    
    // Track the event with App Insights
    appInsights.trackEvent('ReviewUpdated', {
      userId: req.user.id,
      reviewId: review._id,
      itemId: review.itemId,
      itemType: review.itemType
    });
    
    res.json({
      success: true,
      data: {
        review: updatedReview
      }
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    appInsights.trackException(error, { component: 'ReviewsAPI', operation: 'update' });
    res.status(500).json({ 
      success: false, 
      errors: [{ message: 'Server error' }]
    });
  }
});

// @route DELETE /api/reviews/:id
// @desc Delete a review
// @access Private (review author or admin)
router.delete('/:id', [
  auth,
  check('id', 'Review ID must be a valid MongoDB ID').isMongoId()
], async (req, res) => {
  try {
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        errors: [{ message: 'Review not found' }] 
      });
    }
    
    // Check if the user is authorized to delete this review
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        errors: [{ message: 'Not authorized to delete this review' }] 
      });
    }
    
    // Delete the review
    await Review.findByIdAndDelete(req.params.id);
    
    // Recalculate average rating for the item
    const avgRating = await Review.calculateAverageRating(review.itemId, review.itemType);
    
    // Update the item's rating
    if (review.itemType === 'listing') {
      await Listing.findByIdAndUpdate(review.itemId, {
        $set: { 'rating': avgRating }
      });
    } else if (review.itemType === 'seller') {
      await User.findByIdAndUpdate(review.itemId, {
        $set: { 'rating': avgRating }
      });
    }
    
    // Track the event with App Insights
    appInsights.trackEvent('ReviewDeleted', {
      userId: req.user.id,
      reviewId: review._id,
      itemId: review.itemId,
      itemType: review.itemType,
      byAdmin: req.user.role === 'admin'
    });
    
    res.json({
      success: true,
      data: {
        message: 'Review deleted successfully'
      }
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    appInsights.trackException(error, { component: 'ReviewsAPI', operation: 'delete' });
    res.status(500).json({ 
      success: false, 
      errors: [{ message: 'Server error' }]
    });
  }
});

// @route POST /api/reviews/:id/helpful
// @desc Mark a review as helpful
// @access Private
router.post('/:id/helpful', [
  auth,
  check('id', 'Review ID must be a valid MongoDB ID').isMongoId()
], async (req, res) => {
  try {
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        errors: [{ message: 'Review not found' }] 
      });
    }
    
    // Check if the user has already marked this review as helpful
    if (review.helpfulVotes.users.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        errors: [{ message: 'You have already marked this review as helpful' }]
      });
    }
    
    // Add the user to the helpful votes
    review.helpfulVotes.users.push(req.user.id);
    review.helpfulVotes.count += 1;
    
    await review.save();
    
    res.json({
      success: true,
      data: {
        helpfulVotes: review.helpfulVotes.count
      }
    });
    
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    appInsights.trackException(error, { component: 'ReviewsAPI', operation: 'markHelpful' });
    res.status(500).json({ 
      success: false, 
      errors: [{ message: 'Server error' }]
    });
  }
});

// @route POST /api/reviews/:id/report
// @desc Report a review for inappropriate content
// @access Private
router.post('/:id/report', [
  auth,
  [
    check('id', 'Review ID must be a valid MongoDB ID').isMongoId(),
    check('reason', 'Reason for report is required').trim().notEmpty(),
    check('details', 'Additional details are required').trim().notEmpty()
  ]
], async (req, res) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { reason, details } = req.body;
    
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        errors: [{ message: 'Review not found' }] 
      });
    }
    
    // Update the review status to reported
    review.status = 'reported';
    
    // Add a report log to the moderation field
    review.moderation = {
      reportedBy: req.user.id,
      reportedAt: new Date(),
      reason,
      details
    };
    
    await review.save();
    
    // Track the event with App Insights
    appInsights.trackEvent('ReviewReported', {
      userId: req.user.id,
      reviewId: review._id,
      reason
    });
    
    res.json({
      success: true,
      data: {
        message: 'Review reported successfully'
      }
    });
    
  } catch (error) {
    console.error('Error reporting review:', error);
    appInsights.trackException(error, { component: 'ReviewsAPI', operation: 'report' });
    res.status(500).json({ 
      success: false, 
      errors: [{ message: 'Server error' }]
    });
  }
});

// @route PUT /api/reviews/:id/moderate
// @desc Moderate a review (admin only)
// @access Private (admin only)
router.put('/:id/moderate', [
  auth,
  checkRole('admin'),
  [
    check('id', 'Review ID must be a valid MongoDB ID').isMongoId(),
    check('action', 'Action is required').isIn(['approve', 'reject']),
    check('reason', 'Reason is required for rejection').if((value, { req }) => req.body.action === 'reject').trim().notEmpty()
  ]
], async (req, res) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { action, reason } = req.body;
    
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        errors: [{ message: 'Review not found' }] 
      });
    }
    
    // Update review based on moderation action
    if (action === 'approve') {
      review.status = 'published';
    } else {
      review.status = 'rejected';
    }
    
    // Update moderation information
    review.moderation = {
      moderatedBy: req.user.id,
      moderatedAt: new Date(),
      reason: action === 'reject' ? reason : 'Approved by admin'
    };
    
    await review.save();
    
    // If approved, recalculate average rating
    if (action === 'approve') {
      const avgRating = await Review.calculateAverageRating(review.itemId, review.itemType);
      
      // Update the item's rating
      if (review.itemType === 'listing') {
        await Listing.findByIdAndUpdate(review.itemId, {
          $set: { 'rating': avgRating }
        });
      } else if (review.itemType === 'seller') {
        await User.findByIdAndUpdate(review.itemId, {
          $set: { 'rating': avgRating }
        });
      }
    }
    
    // Track the event with App Insights
    appInsights.trackEvent('ReviewModerated', {
      adminId: req.user.id,
      reviewId: review._id,
      action,
      reason: reason || 'Approved'
    });
    
    res.json({
      success: true,
      data: {
        message: `Review ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        review: {
          _id: review._id,
          status: review.status,
          moderation: review.moderation
        }
      }
    });
    
  } catch (error) {
    console.error('Error moderating review:', error);
    appInsights.trackException(error, { component: 'ReviewsAPI', operation: 'moderate' });
    res.status(500).json({ 
      success: false, 
      errors: [{ message: 'Server error' }]
    });
  }
});

module.exports = router; 