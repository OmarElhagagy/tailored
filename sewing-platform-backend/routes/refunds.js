const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const paymentRefundController = require('../controllers/paymentRefundController');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const appInsights = require('../utils/appInsights');

// @route POST /api/refunds/order/:orderId/full
// @desc Process a full refund for an order
// @access Private (admin only)
router.post('/order/:orderId/full', [
  auth,
  checkRole(['admin']),
  [
    check('orderId', 'Order ID is required').isMongoId(),
    check('reason', 'Reason for refund is required').not().isEmpty().trim()
  ]
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { reason } = req.body;

    // Verify the order exists and can be refunded
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        errors: [{ msg: 'Order not found' }]
      });
    }

    // Check if the order has a payment and is in a refundable state
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        errors: [{ msg: 'No payment found for this order' }]
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        errors: [{ msg: 'This order has already been fully refunded' }]
      });
    }

    // Process the refund
    const refundResult = await paymentRefundController.processFullRefund(
      orderId,
      reason,
      req.user.id
    );

    // Return success response
    res.json({
      success: true,
      data: refundResult
    });

  } catch (error) {
    console.error('Error processing full refund:', error);
    appInsights.trackException(error, {
      component: 'RefundsAPI',
      operation: 'processFullRefund',
      userId: req.user.id
    });

    res.status(500).json({
      success: false,
      errors: [{ msg: error.message || 'Server error processing refund' }]
    });
  }
});

// @route POST /api/refunds/order/:orderId/partial
// @desc Process a partial refund for an order
// @access Private (admin only)
router.post('/order/:orderId/partial', [
  auth,
  checkRole(['admin']),
  [
    check('orderId', 'Order ID is required').isMongoId(),
    check('amount', 'Amount must be a positive number').isFloat({ min: 0.01 }),
    check('reason', 'Reason for refund is required').not().isEmpty().trim()
  ]
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { amount, reason } = req.body;

    // Verify the order exists and can be refunded
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        errors: [{ msg: 'Order not found' }]
      });
    }

    // Check if the order has a payment and is in a refundable state
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        errors: [{ msg: 'No payment found for this order' }]
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        errors: [{ msg: 'This order has already been fully refunded' }]
      });
    }

    const totalRefunded = payment.getTotalRefunded();
    if (totalRefunded + amount > payment.amount) {
      return res.status(400).json({
        success: false,
        errors: [{ 
          msg: `Cannot refund more than the remaining amount: ${payment.amount - totalRefunded}` 
        }]
      });
    }

    // Process the partial refund
    const refundResult = await paymentRefundController.processPartialRefund(
      orderId,
      amount,
      reason,
      req.user.id
    );

    // Return success response
    res.json({
      success: true,
      data: refundResult
    });

  } catch (error) {
    console.error('Error processing partial refund:', error);
    appInsights.trackException(error, {
      component: 'RefundsAPI',
      operation: 'processPartialRefund',
      userId: req.user.id
    });

    res.status(500).json({
      success: false,
      errors: [{ msg: error.message || 'Server error processing refund' }]
    });
  }
});

// @route GET /api/refunds/order/:orderId/history
// @desc Get refund history for an order
// @access Private (admin or order owner)
router.get('/order/:orderId/history', [
  auth,
  check('orderId', 'Order ID is required').isMongoId()
], async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        errors: [{ msg: 'Order not found' }]
      });
    }

    // Check user authorization (admin or order owner)
    const isAdmin = req.user.role === 'admin';
    const isOrderOwner = order.buyerId.toString() === req.user.id;
    const isSeller = order.sellerId.toString() === req.user.id;

    if (!isAdmin && !isOrderOwner && !isSeller) {
      return res.status(403).json({
        success: false,
        errors: [{ msg: 'Not authorized to view this order\'s refund history' }]
      });
    }

    // Get refund history
    const refundHistory = await paymentRefundController.getRefundHistory(orderId);

    // Get basic payment info
    const payment = await Payment.findOne({ order: orderId });
    
    // Return response
    res.json({
      success: true,
      data: {
        orderId,
        orderTotal: payment ? payment.amount : 0,
        refunds: refundHistory,
        totalRefunded: refundHistory.reduce((sum, refund) => sum + refund.amount, 0)
      }
    });

  } catch (error) {
    console.error('Error getting refund history:', error);
    appInsights.trackException(error, {
      component: 'RefundsAPI',
      operation: 'getRefundHistory',
      userId: req.user.id
    });

    res.status(500).json({
      success: false,
      errors: [{ msg: 'Server error retrieving refund history' }]
    });
  }
});

module.exports = router;