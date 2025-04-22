const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const PaymentService = require('../utils/paymentService');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const fraudDetection = require('../utils/fraudDetection');
const appInsights = require('../utils/appInsights');

// @route POST /api/payments/initialize
// @desc Initialize a payment for an order
// @access Private
router.post('/initialize', [
  auth,
  [
    check('orderId', 'Order ID is required').isMongoId(),
    check('paymentMethod', 'Valid payment method is required')
      .isIn(['fawry', 'vodafone_cash', 'instapay', 'cash_on_delivery']),
    check('customerMobile', 'Valid phone number is required').matches(/^\+?[0-9]{10,15}$/),
    check('deliveryAddress', 'Delivery address is required for cash on delivery')
      .if((value, { req }) => req.body.paymentMethod === 'cash_on_delivery')
      .isObject()
      .notEmpty()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, paymentMethod, customerMobile, deliveryAddress } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'Order not found' }] });
    }

    // Check if user is authorized to pay for this order
    if (order.buyerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ errors: [{ message: 'Not authorized to pay for this order' }] });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ errors: [{ message: 'Order is already paid' }] });
    }

    // Get buyer info
    const buyer = await User.findById(order.buyerId);
    if (!buyer) {
      return res.status(404).json({ errors: [{ message: 'Buyer not found' }] });
    }

    // Prepare order data for payment
    const orderData = {
      orderId: order._id.toString(),
      amount: order.price.total,
      customerName: buyer.name,
      customerEmail: buyer.email,
      customerMobile: customerMobile || buyer.phone,
      description: `Payment for order #${order._id.toString().slice(-6)}`,
      deliveryAddress
    };

    // Initialize payment based on selected method
    let paymentResponse;

    switch (paymentMethod) {
      case 'fawry':
        paymentResponse = await PaymentService.createFawryPayment({
          ...orderData,
          paymentMethod: 'CARD' // Can be CARD, WALLET, or CASH
        });
        break;
      case 'vodafone_cash':
        paymentResponse = await PaymentService.createVodafoneCashPayment(orderData);
        break;
      case 'instapay':
        paymentResponse = await PaymentService.createInstaPayPayment(orderData);
        break;
      case 'cash_on_delivery':
        paymentResponse = await PaymentService.createCashOnDeliveryPayment(orderData);
        break;
      default:
        return res.status(400).json({ errors: [{ message: 'Unsupported payment method' }] });
    }

    // Record payment initiation in the order
    const paymentTransaction = {
      transactionId: paymentResponse.referenceNumber,
      amount: parseFloat(orderData.amount),
      provider: paymentMethod,
      status: 'pending',
      timestamp: new Date(),
      notes: `Payment initialized via ${paymentMethod}`,
      paymentDetails: paymentResponse
    };

    // Update the order with payment information
    order.paymentMethod = paymentMethod;
    order.paymentTransactions.push(paymentTransaction);
    await order.save();

    // Create notification for seller
    const notification = new Notification({
      userId: order.sellerId,
      type: 'payment_initiated',
      title: 'Payment Initiated',
      message: `Payment has been initiated for order #${order._id.toString().slice(-6)} via ${paymentMethod}`,
      relatedId: order._id,
      relatedType: 'Order'
    });
    await notification.save();

    res.json({
      success: true,
      message: `Payment initialized successfully via ${paymentMethod}`,
      data: paymentResponse
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ errors: [{ message: 'Server error during payment initialization' }] });
  }
});

// @route GET /api/payments/:referenceNumber/verify
// @desc Verify payment status
// @access Private
router.get('/:referenceNumber/verify', auth, async (req, res) => {
  try {
    const { referenceNumber } = req.params;
    
    // Find order with this payment reference
    const order = await Order.findOne({
      'paymentTransactions.transactionId': referenceNumber
    });
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'No order found with this payment reference' }] });
    }
    
    // Check if user is authorized to verify this payment
    if (order.buyerId.toString() !== req.user.id && 
        order.sellerId.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ errors: [{ message: 'Not authorized to verify this payment' }] });
    }
    
    // Find the payment transaction
    const transaction = order.paymentTransactions.find(
      t => t.transactionId === referenceNumber
    );
    
    if (!transaction) {
      return res.status(404).json({ errors: [{ message: 'Transaction not found' }] });
    }
    
    // Verify payment status with payment service
    const verificationResult = await PaymentService.verifyPayment(
      transaction.provider,
      referenceNumber
    );
    
    // Update transaction status if payment is verified
    if (verificationResult.paymentStatus === 'PAID') {
      transaction.status = 'completed';
      transaction.notes += ` | Verified at ${new Date().toISOString()}`;
      
      // Update overall order payment status
      order.paymentStatus = 'paid';
      
      // Add verification to order history
      order.statusHistory.push({
        status: 'payment_verified',
        timestamp: new Date(),
        note: `Payment verified via ${transaction.provider}`
      });
      
      await order.save();
      
      // Create notification for seller
      const notification = new Notification({
        userId: order.sellerId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Payment has been confirmed for order #${order._id.toString().slice(-6)}`,
        relatedId: order._id,
        relatedType: 'Order'
      });
      await notification.save();
    }
    
    res.json({
      success: true,
      data: {
        orderId: order._id,
        referenceNumber,
        paymentMethod: transaction.provider,
        paymentStatus: verificationResult.paymentStatus,
        verificationResult
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ errors: [{ message: 'Server error during payment verification' }] });
  }
});

// @route POST /api/payments/:referenceNumber/mark-as-paid
// @desc Manually mark a payment as completed (for admin or sellers with COD)
// @access Private (admin or seller)
router.post('/:referenceNumber/mark-as-paid', [
  auth,
  [
    check('notes', 'Notes are required when manually marking payment').notEmpty()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { referenceNumber } = req.params;
    const { notes } = req.body;
    
    // Find order with this payment reference
    const order = await Order.findOne({
      'paymentTransactions.transactionId': referenceNumber
    });
    
    if (!order) {
      return res.status(404).json({ errors: [{ message: 'No order found with this payment reference' }] });
    }
    
    // Only admins and the seller of this order can mark payments as paid
    if (order.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ errors: [{ message: 'Not authorized to mark this payment as paid' }] });
    }
    
    // Find the payment transaction
    const transaction = order.paymentTransactions.find(
      t => t.transactionId === referenceNumber
    );
    
    if (!transaction) {
      return res.status(404).json({ errors: [{ message: 'Transaction not found' }] });
    }
    
    // Only allow marking as paid if it's currently pending
    if (transaction.status !== 'pending') {
      return res.status(400).json({ errors: [{ message: `Transaction is already ${transaction.status}` }] });
    }
    
    // Mark transaction as completed
    transaction.status = 'completed';
    transaction.notes += ` | Manually marked as paid by ${req.user.role === 'admin' ? 'admin' : 'seller'}: ${notes}`;
    
    // Update overall order payment status
    order.paymentStatus = 'paid';
    
    // Add to order history
    order.statusHistory.push({
      status: 'payment_confirmed',
      timestamp: new Date(),
      note: `Payment manually marked as paid. Notes: ${notes}`
    });
    
    await order.save();
    
    // Create notification for buyer
    const notification = new Notification({
      userId: order.buyerId,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your payment has been confirmed for order #${order._id.toString().slice(-6)}`,
      relatedId: order._id,
      relatedType: 'Order'
    });
    await notification.save();
    
    res.json({
      success: true,
      message: 'Payment successfully marked as paid',
      data: {
        orderId: order._id,
        referenceNumber,
        paymentStatus: 'PAID',
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route POST /api/payments/init
// @desc Initialize payment for order
// @access Private
router.post('/init', [
  auth,
  [
    check('orderId', 'Order ID is required').not().isEmpty(),
    check('gateway', 'Payment gateway is required').isIn(['fawry', 'paymob', 'paytabs', 'vodafoneCash']),
    check('amount', 'Amount is required').isNumeric(),
    check('returnUrl', 'Return URL is required for online payments').optional()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { orderId, gateway, amount, returnUrl } = req.body;
    
    // Get user information for the payment
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or does not belong to user' });
    }
    
    // Check if amount matches order total
    if (amount !== order.totalPrice) {
      return res.status(400).json({ 
        message: 'Payment amount does not match order total',
        orderTotal: order.totalPrice,
        requestedAmount: amount
      });
    }
    
    // Prepare order data for payment
    const orderData = {
      orderId: order._id.toString(),
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
      amount: amount,
      description: `Payment for Order #${order._id.toString()}`,
      returnUrl: returnUrl
    };
    
    // Initialize payment based on gateway
    let paymentResponse;
    switch (gateway.toLowerCase()) {
      case 'fawry':
        paymentResponse = await PaymentService.createFawryPayment({
          ...orderData,
          paymentMethod: 'CARD' // Can be CARD, WALLET, or CASH
        });
        break;
      case 'paymob':
        paymentResponse = await PaymentService.createPayMobPayment(orderData);
        break;
      case 'paytabs':
        if (!returnUrl) {
          return res.status(400).json({ message: 'Return URL is required for PayTabs payments' });
        }
        paymentResponse = await PaymentService.createPayTabsPayment(orderData);
        break;
      case 'vodafonecash':
        paymentResponse = await PaymentService.createVodafoneCashPayment(orderData);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported payment gateway' });
    }
    
    // Update order with payment information
    order.paymentDetails = {
      gateway,
      referenceNumber: paymentResponse.referenceNumber || paymentResponse.transactionReference || paymentResponse.orderId,
      status: 'pending',
      createdAt: new Date(),
      gatewayResponse: paymentResponse
    };
    
    await order.save();
    
    return res.json(paymentResponse);
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({ message: error.message });
  }
});

// @route GET /api/payments/verify/:gateway/:referenceNumber
// @desc Verify payment status
// @access Private
router.get('/verify/:gateway/:referenceNumber', auth, async (req, res) => {
  try {
    const { gateway, referenceNumber } = req.params;
    
    // Verify payment with payment service
    const verificationResult = await PaymentService.verifyPayment(gateway, referenceNumber);
    
    // Find and update order with payment status
    const order = await Order.findOne({ 
      'paymentDetails.referenceNumber': referenceNumber,
      'paymentDetails.gateway': gateway
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found for this payment reference' });
    }
    
    // Make sure the order belongs to the authenticated user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }
    
    // Update order payment status
    order.paymentDetails.status = verificationResult.status;
    order.paymentDetails.verifiedAt = new Date();
    order.paymentDetails.gatewayResponse = {
      ...order.paymentDetails.gatewayResponse,
      verificationResult
    };
    
    // If payment is successful, update order status
    if (verificationResult.status === 'success') {
      order.status = 'processing';
      order.isPaid = true;
      order.paidAt = new Date();
    }
    
    await order.save();
    
    return res.json({
      paymentStatus: verificationResult.status,
      orderStatus: order.status,
      verificationDetails: verificationResult
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ message: error.message });
  }
});

// @route POST /api/payments/webhook/:gateway
// @desc Payment gateway webhook
// @access Public
router.post('/webhook/:gateway', async (req, res) => {
  try {
    const { gateway } = req.params;
    const payload = req.body;
    
    console.log(`Received ${gateway} webhook:`, payload);
    
    let referenceNumber;
    let paymentStatus;
    
    // Extract reference number and status based on gateway
    switch (gateway.toLowerCase()) {
      case 'fawry':
        referenceNumber = payload.merchantRefNumber;
        paymentStatus = payload.paymentStatus === 'PAID' ? 'success' : 'pending';
        // Verify signature to ensure it's a valid Fawry callback
        // ... (signature verification code would go here)
        break;
      
      case 'paymob':
        referenceNumber = payload.order.id;
        paymentStatus = payload.success === 'true' ? 'success' : 'failed';
        break;
      
      case 'paytabs':
        referenceNumber = payload.cart_id;
        paymentStatus = payload.response_status === 'A' ? 'success' : 'failed';
        break;
      
      // Add other gateways as needed
      
      default:
        return res.status(400).json({ message: 'Unsupported payment gateway' });
    }
    
    if (!referenceNumber) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }
    
    // Update order with payment information
    const order = await Order.findOne({ 
      'paymentDetails.referenceNumber': referenceNumber,
      'paymentDetails.gateway': gateway
    });
    
    if (!order) {
      console.error(`Order not found for reference number: ${referenceNumber}`);
      return res.status(200).end(); // Return 200 to acknowledge receipt even if order not found
    }
    
    // Update order payment status
    order.paymentDetails.status = paymentStatus;
    order.paymentDetails.updatedAt = new Date();
    order.paymentDetails.webhookData = payload;
    
    // If payment is successful, update order status
    if (paymentStatus === 'success') {
      order.status = 'processing';
      order.isPaid = true;
      order.paidAt = new Date();
    }
    
    await order.save();
    
    // Return success response based on gateway requirements
    switch (gateway.toLowerCase()) {
      case 'fawry':
        return res.json({ success: true });
      
      case 'paymob':
        return res.status(200).end();
      
      case 'paytabs':
        return res.json({ success: true });
      
      default:
        return res.status(200).end();
    }
  } catch (error) {
    console.error('Payment webhook error:', error);
    // Still return 200 to acknowledge receipt
    return res.status(200).end();
  }
});

// @route GET /api/payments/methods
// @desc Get available payment methods
// @access Private
router.get('/methods', auth, async (req, res) => {
  try {
    // Get user information to determine available payment methods
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Determine available payment methods
    // Could be based on user location, order amount, etc.
    const availableMethods = [
      {
        id: 'fawry',
        name: 'Fawry',
        description: 'Pay using Fawry service at any Fawry outlet or online',
        isOnline: true,
        fees: '2% of the total amount',
        icon: '/images/payment/fawry.png'
      },
      {
        id: 'paymob',
        name: 'Credit/Debit Card',
        description: 'Pay using Visa, Mastercard, or Meeza card',
        isOnline: true,
        fees: 'No additional fees',
        icon: '/images/payment/card.png'
      }
    ];
    
    // Add Vodafone Cash if user has a Vodafone number
    if (user.phone && (user.phone.startsWith('+2010') || user.phone.startsWith('010'))) {
      availableMethods.push({
        id: 'vodafoneCash',
        name: 'Vodafone Cash',
        description: 'Pay using your Vodafone Cash wallet',
        isOnline: true,
        fees: 'No additional fees',
        icon: '/images/payment/vodafone.png'
      });
    }
    
    // Add cash on delivery based on user's area
    // This would be determined by the user's address
    availableMethods.push({
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay in cash when you receive your order',
      isOnline: false,
      fees: 'Additional 20 EGP delivery fee',
      icon: '/images/payment/cod.png'
    });
    
    return res.json(availableMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Utility to extract payment context from request
const extractPaymentContext = (req) => {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    ipLocation: req.headers['cf-ipcountry'] ? { country: req.headers['cf-ipcountry'] } : null,
    deviceId: req.headers['x-device-id'] || null,
    requestTime: new Date(),
    sessionId: req.headers['x-session-id'] || null
  };
};

/**
 * @route   POST /api/payments/process
 * @desc    Process a payment for an order
 * @access  Private
 */
router.post('/process', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { 
      orderId, 
      paymentMethod, 
      paymentDetails,
      billingAddress,
      shippingAddress = null,  // Optional, can use billing address if not provided
      savePaymentMethod = false // Whether to save payment method for future use
    } = req.body;
    
    if (!orderId || !paymentMethod || !paymentDetails || !billingAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required payment information' 
      });
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if order belongs to current user
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to process payment for this order' 
      });
    }
    
    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is already paid' 
      });
    }

    // Get user data for fraud analysis
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prepare user data for fraud analysis
    const userData = {
      id: user._id.toString(),
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      createdAt: user.createdAt,
      orderCount: user.orderHistory ? user.orderHistory.length : 0,
      averageOrderAmount: user.orderHistory && user.orderHistory.length > 0 
        ? user.orderHistory.reduce((sum, order) => sum + order.total, 0) / user.orderHistory.length 
        : 0
    };

    // Transaction data for fraud analysis
    const transactionData = {
      id: new mongoose.Types.ObjectId().toString(),  // Generate a temporary ID
      orderId: order._id.toString(),
      amount: order.totalAmount,
      currency: 'USD',  // Assuming USD as default
      gateway: paymentMethod,
      cardDetails: {
        nameOnCard: paymentDetails.nameOnCard,
        lastFour: paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : null,
        brand: paymentDetails.brand || null
      },
      billingAddress,
      shippingAddress: shippingAddress || billingAddress,
      retryCount: req.body.retryCount || 0
    };

    // Extract context data for fraud analysis
    const contextData = extractPaymentContext(req);

    // Perform fraud detection analysis
    const fraudAnalysis = await fraudDetection.analyzeTransaction(
      transactionData, 
      userData,
      contextData
    );
    
    appInsights.trackEvent('PaymentProcessed', {
      orderId: order._id.toString(),
      amount: order.totalAmount,
      gateway: paymentMethod,
      fraudRiskScore: fraudAnalysis.riskScore,
      fraudRiskLevel: fraudAnalysis.riskLevel
    });

    // Check if the transaction is high risk
    if (fraudAnalysis.action === 'block') {
      // Log the blocked transaction
      appInsights.trackEvent('PaymentBlocked', {
        orderId: order._id.toString(),
        userId: req.user.id,
        riskScore: fraudAnalysis.riskScore,
        riskFactors: fraudAnalysis.riskFactors.join(', ')
      });
      
      return res.status(403).json({
        success: false,
        message: 'Payment cannot be processed due to security concerns',
        requiresReview: true
      });
    }

    // For medium risk transactions that require additional verification
    if (fraudAnalysis.action === 'challenge') {
      // In a real implementation, this would trigger additional verification
      // like 3D Secure, two-factor authentication, or manual review
      
      // For this example, we'll just flag it but allow it to proceed
      appInsights.trackEvent('PaymentRequiresVerification', {
        orderId: order._id.toString(),
        userId: req.user.id,
        riskScore: fraudAnalysis.riskScore,
        riskFactors: fraudAnalysis.riskFactors.join(', ')
      });
      
      // Note: In a production system, you might return a different response
      // that would prompt additional verification steps
    }

    // In a real implementation, this is where you would:
    // 1. Make API call to payment processor (Stripe, PayPal, etc)
    // 2. Process the payment result
    // 3. Update order status
    
    // For this example, we'll simulate a successful payment
    const payment = new Payment({
      order: order._id,
      user: req.user.id,
      amount: order.totalAmount,
      paymentMethod,
      paymentDetails: {
        lastFour: paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : null,
        expiryMonth: paymentDetails.expiryMonth,
        expiryYear: paymentDetails.expiryYear,
        nameOnCard: paymentDetails.nameOnCard
      },
      billingAddress,
      transactionId: `sim_${Date.now()}`,  // Simulated transaction ID
      status: 'completed',
      fraudRiskScore: fraudAnalysis.riskScore,
      fraudRiskLevel: fraudAnalysis.riskLevel
    });

    await payment.save({ session });

    // Update order as paid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: payment._id,
      status: 'completed',
      update_time: new Date(),
      email_address: user.email
    };

    await order.save({ session });

    // If user chose to save payment method and it's not high risk
    if (savePaymentMethod && fraudAnalysis.riskLevel !== 'high') {
      // Add payment method to user's saved methods
      // In a real implementation, you'd save a token from the payment provider
      if (!user.paymentMethods) {
        user.paymentMethods = [];
      }
      
      user.paymentMethods.push({
        type: paymentMethod,
        lastFour: paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : null,
        expiryMonth: paymentDetails.expiryMonth,
        expiryYear: paymentDetails.expiryYear,
        nameOnCard: paymentDetails.nameOnCard,
        isDefault: user.paymentMethods.length === 0
      });
      
      await user.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      paymentId: payment._id,
      order: {
        id: order._id,
        status: order.status
      }
    });
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Payment processing error:', error);
    appInsights.trackException(error, { component: 'PaymentRoutes' });
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/payments/methods
 * @desc    Get user's saved payment methods
 * @access  Private
 */
router.get('/methods', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('paymentMethods');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      paymentMethods: user.paymentMethods || []
    });
    
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    appInsights.trackException(error, { component: 'PaymentRoutes' });
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while getting payment methods',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/payments/methods/:methodId
 * @desc    Remove a saved payment method
 * @access  Private
 */
router.delete('/methods/:methodId', auth, async (req, res) => {
  try {
    const { methodId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.paymentMethods || user.paymentMethods.length === 0) {
      return res.status(404).json({ success: false, message: 'No payment methods found' });
    }
    
    const methodIndex = user.paymentMethods.findIndex(method => 
      method._id.toString() === methodId
    );
    
    if (methodIndex === -1) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
    
    // Check if we're removing the default method
    const isDefault = user.paymentMethods[methodIndex].isDefault;
    
    // Remove the payment method
    user.paymentMethods.splice(methodIndex, 1);
    
    // If we removed the default and have other methods, make the first one default
    if (isDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully'
    });
    
  } catch (error) {
    console.error('Error removing payment method:', error);
    appInsights.trackException(error, { component: 'PaymentRoutes' });
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while removing payment method',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PATCH /api/payments/methods/:methodId/default
 * @desc    Set a payment method as default
 * @access  Private
 */
router.patch('/methods/:methodId/default', auth, async (req, res) => {
  try {
    const { methodId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.paymentMethods || user.paymentMethods.length === 0) {
      return res.status(404).json({ success: false, message: 'No payment methods found' });
    }
    
    // Reset all payment methods to non-default
    user.paymentMethods.forEach(method => {
      method.isDefault = false;
    });
    
    // Find and set the specified method as default
    const method = user.paymentMethods.find(m => m._id.toString() === methodId);
    
    if (!method) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
    
    method.isDefault = true;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Default payment method updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating default payment method:', error);
    appInsights.trackException(error, { component: 'PaymentRoutes' });
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating default payment method',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'order',
        select: 'orderNumber items status shippingAddress createdAt'
      });
    
    res.status(200).json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        orderId: payment.order._id,
        orderNumber: payment.order.orderNumber,
        date: payment.createdAt,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        lastFour: payment.paymentDetails.lastFour
      }))
    });
    
  } catch (error) {
    console.error('Error fetching payment history:', error);
    appInsights.trackException(error, { component: 'PaymentRoutes' });
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while getting payment history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 