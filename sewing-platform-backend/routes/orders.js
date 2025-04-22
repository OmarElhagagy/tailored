const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const requireLegalAcceptance = require('../middleware/requireLegalAcceptance');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
const Notification = require('../models/Notification');
const uploadMiddleware = require('../middleware/upload');

// @route POST /api/orders
// @desc Create a new order
// @access Private (Any authenticated user)
router.post('/', [
  auth,
  requireLegalAcceptance(['terms_of_service', 'return_policy']),
  [
    check('listingId', 'Listing ID is required').isMongoId(),
    check('quantity', 'Quantity must be a number').isNumeric().toInt(),
    check('deliveryAddress', 'Delivery address is required when not pickup').if((value, { req }) => {
      return req.body.deliveryMethod !== 'pickup';
    }).isObject(),
    check('deliveryMethod', 'Delivery method is required').isIn(['pickup', 'standard', 'express', 'overnight']),
    check('paymentMethod', 'Payment method is required').isIn(['cash', 'negotiated', 'online', 'bank_transfer', 'credit_card', 'debit_card', 'paypal', 'other']),
    check('termsAccepted', 'You must accept the terms and conditions').equals('true')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      listingId,
      quantity,
      customRequest,
      customizationChoices,
      deliveryAddress,
      deliveryMethod,
      paymentMethod,
      scheduledDay
    } = req.body;

    // Validate listing exists
    const listing = await Listing.findById(listingId).populate('sellerId');
    if (!listing) {
      return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return res.status(400).json({ errors: [{ message: 'This listing is not currently available' }] });
    }

    // Verify the seller's credentials if it's a business seller
    if (listing.sellerId.role === 'seller') {
      const seller = await User.findById(listing.sellerId._id);
      if (seller.credentialVerificationStatus !== 'verified') {
        return res.status(400).json({ 
          errors: [{ message: 'Cannot place order with unverified seller' }] 
        });
      }
    }

    // Check inventory availability if listing uses inventory items
    if (listing.inventoryItems && listing.inventoryItems.length > 0) {
      const hasEnoughInventory = await listing.checkInventory();
      if (!hasEnoughInventory) {
        return res.status(400).json({ 
          errors: [{ message: 'Not enough inventory available for this order' }] 
        });
      }
    }

    // Validate customization choices if provided
    if (customizationChoices && Object.keys(customizationChoices).length > 0) {
      if (!listing.customizable) {
        return res.status(400).json({ 
          errors: [{ message: 'This listing does not support customization' }] 
        });
      }

      // Check that each customization option is valid for this listing
      if (listing.customizationOptions && listing.customizationOptions.length > 0) {
        for (const [optionName, selectedChoice] of Object.entries(customizationChoices)) {
          const option = listing.customizationOptions.find(opt => opt.name === optionName);
          if (!option) {
            return res.status(400).json({ 
              errors: [{ message: `Invalid customization option: ${optionName}` }] 
            });
          }
          if (!option.choices.includes(selectedChoice)) {
            return res.status(400).json({ 
              errors: [{ message: `Invalid choice "${selectedChoice}" for option "${optionName}"` }] 
            });
          }
        }
      }
    }

    // Calculate order price using the pricing methods in Listing model
    const pricingDetails = listing.calculateTotalPrice(quantity, customizationChoices);
    let basePrice = pricingDetails.basePrice;
    let totalBasePrice = pricingDetails.totalBasePrice;
    
    // Calculate customization fee
    let customizationFee = 0;
    if (listing.customizable && customizationChoices && Object.keys(customizationChoices).length > 0) {
      customizationFee = Object.keys(customizationChoices).length * 10; // $10 per customization
    }
    
    // Calculate material costs if using inventory
    let materialCost = 0;
    if (listing.inventoryItems && listing.inventoryItems.length > 0) {
      const inventoryItemIds = listing.inventoryItems.map(item => item.itemId);
      const inventoryItems = await InventoryItem.find({ 
        _id: { $in: inventoryItemIds } 
      });
      
      if (inventoryItems.length > 0) {
        materialCost = inventoryItems.reduce((total, item) => {
          const listingItem = listing.inventoryItems.find(i => i.itemId.toString() === item._id.toString());
          return total + (item.price * listingItem.quantity);
        }, 0);
      }
    }
    
    // Get delivery fee from listing's delivery options
    const deliveryFee = listing.getDeliveryFee(deliveryMethod);
    
    // Calculate handling fee
    const handlingFee = 5.00; // Flat handling fee
    
    // Calculate subtotal before discount
    const subtotalBeforeDiscount = totalBasePrice + customizationFee + materialCost + deliveryFee + handlingFee;
    
    // Get bulk discount from listing's bulk discounts
    const bulkDiscount = listing.getBulkDiscount(quantity, totalBasePrice);
    
    // Platform fee (set to 0 for now, can be implemented later)
    const platformFee = 0;
    
    // Calculate subtotal after discount
    const subtotal = (subtotalBeforeDiscount - bulkDiscount + platformFee).toFixed(2);
    
    // Calculate tax (using a fixed rate for simplicity)
    const taxRate = 0.08; // 8% tax rate
    const taxAmount = (subtotal * taxRate).toFixed(2);
    
    // Calculate total
    const total = (parseFloat(subtotal) + parseFloat(taxAmount)).toFixed(2);

    // Create the new order
    const newOrder = new Order({
      buyerId: req.user.id,
      sellerId: listing.sellerId._id,
      listingId,
      quantity,
      customRequest,
      customizationChoices: customizationChoices || {},
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: Date.now(),
          note: 'Order placed'
        }
      ],
      scheduledDay: scheduledDay ? new Date(scheduledDay) : null,
      paymentMethod,
      paymentStatus: 'pending',
      deliveryAddress: deliveryMethod === 'pickup' ? null : deliveryAddress,
      deliveryMethod,
      price: {
        base: basePrice,
        materialCost,
        customizationFee,
        deliveryFee,
        bulkDiscount,
        handlingFee,
        platformFee,
        subtotal: parseFloat(subtotal),
        taxRate,
        taxAmount: parseFloat(taxAmount),
        total: parseFloat(total),
        currency: 'USD'
      },
      termsAccepted: true,
      termsAcceptedDate: Date.now()
    });

    const savedOrder = await newOrder.save();

    // Create notification for seller
    const notification = new Notification({
      userId: listing.sellerId._id,
      type: 'new_order',
      title: 'New Order Received',
      message: `You have received a new order for ${listing.title}`,
      relatedId: savedOrder._id,
      relatedType: 'Order'
    });
    
    await notification.save();

    // If using inventory, update inventory levels
    if (listing.inventoryItems && listing.inventoryItems.length > 0) {
      const lowStockItems = [];
      const outOfStockItems = [];

      for (const item of listing.inventoryItems) {
        const inventoryItem = await InventoryItem.findById(item.itemId);
        if (inventoryItem) {
          // Calculate total quantity to remove based on order quantity
          const removeQuantity = -(item.quantity * quantity);
          
          // Update inventory with tracking information
          const updateResult = await inventoryItem.updateStock(
            removeQuantity, 
            'order',
            {
              notes: `Order #${savedOrder._id.toString().slice(-6)} for listing: ${listing.title}`,
              reference: savedOrder._id.toString(),
              performedBy: req.user.id,
              orderId: savedOrder._id
            }
          );
          
          // Track items that need alerts
          if (updateResult.needsLowStockAlert) {
            lowStockItems.push(inventoryItem);
          }
          
          if (updateResult.needsOutOfStockAlert) {
            outOfStockItems.push(inventoryItem);
          }
        }
      }

      // Create low stock notifications if needed
      if (lowStockItems.length > 0) {
        const lowStockNotification = new Notification({
          userId: listing.sellerId._id,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${lowStockItems.length} item(s) are running low after recent order.`,
          relatedId: savedOrder._id,
          relatedType: 'Order',
          data: {
            items: lowStockItems.map(item => ({
              id: item._id,
              name: item.name,
              stock: item.stock,
              threshold: item.threshold
            }))
          },
          priority: 'high'
        });
        
        await lowStockNotification.save();
      }

      // Create out of stock notifications if needed
      if (outOfStockItems.length > 0) {
        const outOfStockNotification = new Notification({
          userId: listing.sellerId._id,
          type: 'out_of_stock',
          title: 'Out of Stock Alert',
          message: `${outOfStockItems.length} item(s) are now out of stock after recent order.`,
          relatedId: savedOrder._id,
          relatedType: 'Order',
          data: {
            items: outOfStockItems.map(item => ({
              id: item._id,
              name: item.name
            }))
          },
          priority: 'urgent'
        });
        
        await outOfStockNotification.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: savedOrder
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/orders
// @desc Get orders for the authenticated user
// @access Private
router.get('/', [
  auth
], async (req, res) => {
  try {
    const { status, role = 'buyer', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {};
    
    // Filter by user role (buyer or seller)
    if (role === 'buyer') {
      query.buyerId = req.user.id;
    } else if (role === 'seller') {
      query.sellerId = req.user.id;
    } else {
      return res.status(400).json({ errors: [{ message: 'Invalid role parameter' }] });
    }
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('listingId', 'title mainPhoto price')
      .populate(role === 'buyer' ? 'sellerId' : 'buyerId', 'name businessName');
    
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: skip + orders.length < totalOrders
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/orders/:id
// @desc Get a specific order
// @access Private (Order buyer, seller, or admin)
router.get('/:id', [
  auth
], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('listingId')
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'businessName email phone businessAddress');
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check if user is authorized to view this order
    if (
      order.buyerId._id.toString() !== req.user.id &&
      order.sellerId._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ errors: [{ message: 'Not authorized to view this order' }] });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PUT /api/orders/:id/status
// @desc Update order status
// @access Private (Order seller or admin)
router.put('/:id/status', [
  auth,
  [
    check('status', 'Status is required').isIn([
      'pending', 'accepted', 'making', 'ready', 'delivered', 'canceled', 'completed', 'disputed'
    ]),
    check('note', 'Note is required').optional().notEmpty()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check if user is authorized to update this order
    if (
      order.sellerId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ errors: [{ message: 'Not authorized to update this order' }] });
    }
    
    // Some status transitions may have additional requirements
    if (status === 'canceled' && order.status === 'making') {
      return res.status(400).json({ 
        errors: [{ message: 'Cannot cancel an order that is already being made' }] 
      });
    }
    
    // Update the order status
    await order.updateStatus(status, note || '');
    
    // Create notification for buyer
    const notification = new Notification({
      userId: order.buyerId,
      type: 'order_status_update',
      title: 'Order Status Updated',
      message: `Your order #${order._id.toString().slice(-6)} has been updated to: ${status}`,
      relatedId: order._id,
      relatedType: 'Order'
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order._id,
        status: order.status,
        statusHistory: order.statusHistory
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/orders/:id/payment
// @desc Record a payment for an order
// @access Private (Order buyer or admin)
router.post('/:id/payment', [
  auth,
  [
    check('amount', 'Payment amount is required').isNumeric(),
    check('transactionId', 'Transaction ID is required').optional().notEmpty(),
    check('provider', 'Payment provider is required').notEmpty(),
    check('status', 'Payment status is required').isIn(['pending', 'completed', 'failed', 'refunded'])
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { amount, transactionId, provider, status, notes } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check if user is authorized
    if (
      order.buyerId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ errors: [{ message: 'Not authorized to add payment to this order' }] });
    }
    
    // Add the payment transaction
    const transaction = {
      transactionId: transactionId || `manual-${Date.now()}`,
      amount: parseFloat(amount),
      status,
      provider,
      timestamp: Date.now(),
      notes: notes || ''
    };
    
    await order.addPaymentTransaction(transaction);
    
    // If payment completed, notify seller
    if (status === 'completed') {
      const notification = new Notification({
        userId: order.sellerId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of $${amount} received for order #${order._id.toString().slice(-6)}`,
        relatedId: order._id,
        relatedType: 'Order'
      });
      
      await notification.save();
    }
    
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        transaction
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/orders/:id/notes
// @desc Add a note to an order
// @access Private (Order buyer, seller, or admin)
router.post('/:id/notes', [
  auth,
  [
    check('note', 'Note content is required').notEmpty(),
    check('isPrivate', 'isPrivate must be a boolean').optional().isBoolean()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { note, isPrivate = false } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check if user is authorized
    if (
      order.buyerId.toString() !== req.user.id &&
      order.sellerId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ errors: [{ message: 'Not authorized to add notes to this order' }] });
    }
    
    // Determine user role for this order
    let userRole;
    if (order.buyerId.toString() === req.user.id) {
      userRole = 'buyer';
    } else if (order.sellerId.toString() === req.user.id) {
      userRole = 'seller';
    } else {
      userRole = 'admin';
    }
    
    // Add the note
    await order.addNote(note, req.user.id, userRole, isPrivate);
    
    // Notify the other party if not private
    if (!isPrivate) {
      const recipientId = userRole === 'buyer' ? order.sellerId : order.buyerId;
      
      const notification = new Notification({
        userId: recipientId,
        type: 'order_note',
        title: 'New Order Note',
        message: `New note added to order #${order._id.toString().slice(-6)}`,
        relatedId: order._id,
        relatedType: 'Order'
      });
      
      await notification.save();
    }
    
    res.json({
      success: true,
      message: 'Note added successfully',
      data: {
        orderId: order._id,
        orderNotes: order.orderNotes
      }
    });
  } catch (error) {
    console.error('Error adding note:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/orders/:id/rating
// @desc Rate an order
// @access Private (Order buyer only)
router.post('/:id/rating', [
  auth,
  [
    check('value', 'Rating value must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').optional().notEmpty(),
    check('aspects', 'Aspects must be an object with numeric ratings').optional().isObject(),
    check('aspects.*.value', 'Aspect ratings must be between 1 and 5').optional().isInt({ min: 1, max: 5 })
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { value, comment, aspects } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check if user is the buyer
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Only the buyer can rate this order' }] });
    }
    
    // Check if order is completed
    if (order.status !== 'completed' && order.status !== 'delivered') {
      return res.status(400).json({ 
        errors: [{ message: 'Can only rate completed or delivered orders' }] 
      });
    }
    
    // Update the order with the rating
    order.rating = {
      value: parseInt(value),
      comment: comment || '',
      timestamp: Date.now(),
      aspects: {
        quality: aspects?.quality || value,
        communication: aspects?.communication || value,
        delivery: aspects?.delivery || value,
        valueForMoney: aspects?.valueForMoney || value
      }
    };
    
    await order.save();
    
    // Update the listing rating
    const listing = await Listing.findById(order.listingId);
    if (listing) {
      // Calculate the new average rating
      const newRatingCount = listing.rating.count + 1;
      const newRatingAverage = (
        (listing.rating.average * listing.rating.count) + parseInt(value)
      ) / newRatingCount;
      
      listing.rating = {
        average: parseFloat(newRatingAverage.toFixed(1)),
        count: newRatingCount
      };
      
      await listing.save();
    }
    
    // Update seller's average ratings
    const seller = await User.findById(order.sellerId);
    if (seller) {
      // Initialize seller rating if not present
      if (!seller.rating) {
        seller.rating = {
          average: 0,
          count: 0,
          aspectAverages: {
            quality: 0,
            communication: 0,
            delivery: 0,
            valueForMoney: 0
          }
        };
      }
      
      // Calculate new overall average
      const newCount = seller.rating.count + 1;
      const newAverage = (
        (seller.rating.average * seller.rating.count) + parseInt(value)
      ) / newCount;
      
      // Calculate new aspect averages
      const aspectAverages = {
        quality: ((seller.rating.aspectAverages?.quality || 0) * seller.rating.count + (aspects?.quality || value)) / newCount,
        communication: ((seller.rating.aspectAverages?.communication || 0) * seller.rating.count + (aspects?.communication || value)) / newCount,
        delivery: ((seller.rating.aspectAverages?.delivery || 0) * seller.rating.count + (aspects?.delivery || value)) / newCount,
        valueForMoney: ((seller.rating.aspectAverages?.valueForMoney || 0) * seller.rating.count + (aspects?.valueForMoney || value)) / newCount
      };
      
      // Update seller rating
      seller.rating = {
        average: parseFloat(newAverage.toFixed(1)),
        count: newCount,
        aspectAverages: {
          quality: parseFloat(aspectAverages.quality.toFixed(1)),
          communication: parseFloat(aspectAverages.communication.toFixed(1)),
          delivery: parseFloat(aspectAverages.delivery.toFixed(1)),
          valueForMoney: parseFloat(aspectAverages.valueForMoney.toFixed(1))
        }
      };
      
      await seller.save();
    }
    
    // Notify the seller
    const notification = new Notification({
      userId: order.sellerId,
      type: 'order_rated',
      title: 'Order Rated',
      message: `Your order #${order._id.toString().slice(-6)} has been rated ${value}/5 stars`,
      relatedId: order._id,
      relatedType: 'Order'
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: 'Order rated successfully',
      data: {
        orderId: order._id,
        rating: order.rating
      }
    });
  } catch (error) {
    console.error('Error rating order:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/orders/:id/rating/photos
// @desc Add photos to an order rating
// @access Private (Order buyer only)
router.post('/:id/rating/photos', [
  auth,
  uploadMiddleware.array('photos', 5) // Allow up to 5 photos per review
], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check if user is the buyer
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Only the buyer can add photos to this review' }] });
    }
    
    // Check if order has been rated
    if (!order.rating || !order.rating.value) {
      return res.status(400).json({ 
        errors: [{ message: 'Order must be rated before adding photos' }] 
      });
    }
    
    // Get uploaded file paths
    const photos = req.files.map(file => ({
      url: file.filename,
      caption: '',
      uploadDate: Date.now()
    }));
    
    // Initialize photos array if it doesn't exist
    if (!order.rating.photos) {
      order.rating.photos = [];
    }
    
    // Add new photos
    order.rating.photos.push(...photos);
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Photos added to review successfully',
      data: {
        orderId: order._id,
        photos: order.rating.photos
      }
    });
  } catch (error) {
    console.error('Error adding photos to review:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route DELETE /api/orders/:id/rating/photos/:photoId
// @desc Delete a photo from a review
// @access Private (Order buyer only)
router.delete('/:id/rating/photos/:photoId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check if user is the buyer
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ message: 'Only the buyer can delete photos from this review' }] });
    }
    
    // Check if order has photos
    if (!order.rating || !order.rating.photos || order.rating.photos.length === 0) {
      return res.status(400).json({ 
        errors: [{ message: 'No photos found for this review' }] 
      });
    }
    
    // Find the photo to remove
    const photoIndex = order.rating.photos.findIndex(p => p._id.toString() === req.params.photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({ errors: [{ message: 'Photo not found' }] });
    }
    
    // Remove the photo
    order.rating.photos.splice(photoIndex, 1);
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Photo removed from review successfully',
      data: {
        orderId: order._id,
        remainingPhotos: order.rating.photos
      }
    });
  } catch (error) {
    console.error('Error removing photo from review:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order or photo not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/orders/:id/tracking
// @desc Add or update tracking information for an order
// @access Private (Seller only)
router.post('/:id/tracking', [
  auth,
  checkRole('seller'),
  [
    check('carrier', 'Carrier is required').not().isEmpty(),
    check('trackingNumber', 'Tracking number is required').not().isEmpty(),
    check('trackingUrl', 'Tracking URL is required').optional().isURL()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      carrier, 
      trackingNumber, 
      trackingUrl, 
      estimatedDelivery, 
      signatureRequired,
      deliveryInstructions
    } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Validate seller ownership
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        errors: [{ message: 'You do not have permission to update this order' }] 
      });
    }
    
    // Initialize tracking info if it doesn't exist
    if (!order.trackingInfo) {
      order.trackingInfo = {};
    }
    
    // Update tracking information
    order.trackingInfo = {
      ...order.trackingInfo,
      carrier,
      trackingNumber,
      trackingUrl: trackingUrl || `https://track.${carrier.toLowerCase().replace(/\s+/g, '')}.com/${trackingNumber}`,
      lastUpdated: Date.now(),
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      signatureRequired: signatureRequired || false,
      deliveryInstructions: deliveryInstructions || '',
      currentStatus: 'info_received',
      notificationsEnabled: true
    };
    
    // Add initial status to history
    if (!order.trackingInfo.statusHistory) {
      order.trackingInfo.statusHistory = [];
    }
    
    order.trackingInfo.statusHistory.push({
      status: 'info_received',
      timestamp: Date.now(),
      description: `Shipping label created by ${carrier}`
    });
    
    // Update order status to shipped if not already
    if (order.status === 'processing') {
      order.status = 'shipped';
      
      // Add milestone
      if (!order.milestones) {
        order.milestones = [];
      }
      
      order.milestones.push({
        name: 'Shipped',
        isCompleted: true,
        completedDate: Date.now(),
        description: `Your order has been shipped via ${carrier}`
      });
      
      // Update progress percentage
      order.progressPercentage = 60;
    }
    
    await order.save();
    
    // Create notification for buyer
    const notification = new Notification({
      userId: order.buyerId,
      type: 'order_shipped',
      title: 'Order Shipped',
      message: `Your order #${order._id.toString().slice(-6)} has been shipped via ${carrier}. Tracking number: ${trackingNumber}`,
      relatedId: order._id,
      relatedType: 'Order'
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: 'Tracking information updated',
      data: order.trackingInfo
    });
  } catch (error) {
    console.error('Error updating tracking info:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/orders/:id/tracking/status
// @desc Update tracking status
// @access Private (Seller only)
router.post('/:id/tracking/status', [
  auth,
  checkRole('seller'),
  [
    check('status', 'Status is required').isIn([
      'info_received', 
      'in_transit', 
      'out_for_delivery', 
      'delivery_attempt', 
      'exception', 
      'delivered'
    ]),
    check('description', 'Description is required').not().isEmpty()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { status, description, location } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Validate seller ownership
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        errors: [{ message: 'You do not have permission to update this order' }] 
      });
    }
    
    // Check if tracking info exists
    if (!order.trackingInfo) {
      return res.status(400).json({ 
        errors: [{ message: 'Tracking information must be added first' }] 
      });
    }
    
    // Create status history if it doesn't exist
    if (!order.trackingInfo.statusHistory) {
      order.trackingInfo.statusHistory = [];
    }
    
    // Add status update
    order.trackingInfo.statusHistory.push({
      status,
      description,
      location,
      timestamp: Date.now()
    });
    
    // Update current status
    order.trackingInfo.currentStatus = status;
    order.trackingInfo.lastUpdated = Date.now();
    
    // If order is delivered, update order status
    if (status === 'delivered') {
      order.status = 'delivered';
      order.trackingInfo.actualDelivery = Date.now();
      
      // Add milestone
      if (!order.milestones) {
        order.milestones = [];
      }
      
      order.milestones.push({
        name: 'Delivered',
        isCompleted: true,
        completedDate: Date.now(),
        description: 'Your order has been delivered'
      });
      
      // Update progress percentage
      order.progressPercentage = 80;
    }
    
    await order.save();
    
    // Create notification for buyer if notifications are enabled
    if (order.trackingInfo.notificationsEnabled) {
      const notification = new Notification({
        userId: order.buyerId,
        type: 'order_tracking_update',
        title: 'Order Status Update',
        message: `Your order #${order._id.toString().slice(-6)} is now "${status.replace('_', ' ')}": ${description}`,
        relatedId: order._id,
        relatedType: 'Order'
      });
      
      await notification.save();
      
      // Update last notification sent time
      order.trackingInfo.lastNotificationSent = Date.now();
      await order.save();
    }
    
    res.json({
      success: true,
      message: 'Tracking status updated',
      data: {
        currentStatus: order.trackingInfo.currentStatus,
        statusHistory: order.trackingInfo.statusHistory
      }
    });
  } catch (error) {
    console.error('Error updating tracking status:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/orders/:id/tracking
// @desc Get tracking information for an order
// @access Private (Order buyer or seller)
router.get('/:id/tracking', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check permission
    if (order.buyerId.toString() !== req.user.id && order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        errors: [{ message: 'You do not have permission to view this order' }] 
      });
    }
    
    // Check if tracking exists
    if (!order.trackingInfo || !order.trackingInfo.trackingNumber) {
      return res.status(404).json({ 
        errors: [{ message: 'No tracking information available for this order' }] 
      });
    }
    
    res.json({
      success: true,
      data: {
        trackingInfo: order.trackingInfo,
        orderStatus: order.status,
        orderProgress: order.progressPercentage
      }
    });
  } catch (error) {
    console.error('Error retrieving tracking info:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route PATCH /api/orders/:id/tracking/notifications
// @desc Toggle tracking notifications for an order
// @access Private (Order buyer only)
router.patch('/:id/tracking/notifications', [
  auth,
  [
    check('enabled', 'Enabled status must be a boolean').isBoolean()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { enabled } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    // Check if user is the buyer
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        errors: [{ message: 'Only the buyer can update notification preferences' }] 
      });
    }
    
    // Check if tracking exists
    if (!order.trackingInfo) {
      return res.status(404).json({ 
        errors: [{ message: 'No tracking information available for this order' }] 
      });
    }
    
    // Update notification preferences
    order.trackingInfo.notificationsEnabled = enabled;
    
    await order.save();
    
    res.json({
      success: true,
      message: `Tracking notifications ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        notificationsEnabled: order.trackingInfo.notificationsEnabled
      }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router;
