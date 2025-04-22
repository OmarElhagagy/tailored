const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const paymentGateways = require('../utils/paymentGateways');
const appInsights = require('../utils/appInsights');

/**
 * Payment Refund Controller
 * Handles processing refunds for orders
 */
class PaymentRefundController {
  /**
   * Process a full refund for an order
   * @param {string} orderId - The order ID to refund
   * @param {string} reason - Reason for refund
   * @param {string} adminId - ID of admin processing the refund (if applicable)
   * @returns {Promise<Object>} Refund result
   */
  async processFullRefund(orderId, reason, adminId = null) {
    try {
      // Find the original payment
      const payment = await Payment.findOne({ order: orderId });
      
      if (!payment) {
        throw new Error('No payment found for this order');
      }
      
      if (payment.status === 'refunded') {
        throw new Error('Payment has already been fully refunded');
      }
      
      // Find the order
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Get refund amount (full amount)
      const refundAmount = payment.amount;
      
      // Track refund attempt
      appInsights.trackEvent('RefundAttempt', {
        orderId,
        paymentId: payment._id,
        amount: refundAmount,
        type: 'full',
        initiatedBy: adminId || 'system'
      });
      
      // Process the refund with the payment gateway
      const refundResult = await paymentGateways.processRefund(
        payment.paymentMethod,
        {
          transactionId: payment.transactionId,
          amount: refundAmount,
          reason
        }
      );
      
      // Update the payment record with refund information
      await payment.createRefund(refundAmount, reason);
      
      // Update order status
      order.status = 'refunded';
      order.statusHistory.push({
        status: 'refunded',
        date: new Date(),
        note: reason,
        updatedBy: adminId
      });
      
      await order.save();
      
      // Track successful refund
      appInsights.trackEvent('RefundProcessed', {
        orderId,
        paymentId: payment._id,
        refundId: refundResult.refundId,
        amount: refundAmount,
        reason,
        initiatedBy: adminId || 'system'
      });
      
      return {
        success: true,
        refundId: refundResult.refundId,
        amount: refundAmount,
        order: {
          id: order._id,
          status: order.status
        },
        payment: {
          id: payment._id,
          status: payment.status
        }
      };
    } catch (error) {
      console.error('Error processing full refund:', error);
      appInsights.trackException(error, {
        component: 'PaymentRefundController',
        operation: 'processFullRefund',
        orderId
      });
      
      throw error;
    }
  }
  
  /**
   * Process a partial refund for an order
   * @param {string} orderId - The order ID to refund
   * @param {number} amount - Amount to refund
   * @param {string} reason - Reason for refund
   * @param {string} adminId - ID of admin processing the refund (if applicable)
   * @returns {Promise<Object>} Refund result
   */
  async processPartialRefund(orderId, amount, reason, adminId = null) {
    try {
      // Find the original payment
      const payment = await Payment.findOne({ order: orderId });
      
      if (!payment) {
        throw new Error('No payment found for this order');
      }
      
      if (payment.status === 'refunded') {
        throw new Error('Payment has already been fully refunded');
      }
      
      // Validate refund amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid refund amount');
      }
      
      if (amount > payment.amount) {
        throw new Error('Refund amount cannot exceed original payment amount');
      }
      
      // Calculate total already refunded
      const totalRefunded = payment.getTotalRefunded();
      
      if (totalRefunded + amount > payment.amount) {
        throw new Error(`Cannot refund more than the remaining amount: ${payment.amount - totalRefunded}`);
      }
      
      // Find the order
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Track refund attempt
      appInsights.trackEvent('RefundAttempt', {
        orderId,
        paymentId: payment._id,
        amount,
        type: 'partial',
        initiatedBy: adminId || 'system'
      });
      
      // Process the refund with the payment gateway
      const refundResult = await paymentGateways.processRefund(
        payment.paymentMethod,
        {
          transactionId: payment.transactionId,
          amount,
          reason
        }
      );
      
      // Update the payment record with refund information
      await payment.createRefund(amount, reason);
      
      // Update order status if necessary
      if (payment.status === 'refunded') {
        order.status = 'refunded';
      } else {
        order.status = 'partially_refunded';
      }
      
      order.statusHistory.push({
        status: order.status,
        date: new Date(),
        note: `Partial refund: ${amount} - ${reason}`,
        updatedBy: adminId
      });
      
      await order.save();
      
      // Track successful refund
      appInsights.trackEvent('RefundProcessed', {
        orderId,
        paymentId: payment._id,
        refundId: refundResult.refundId,
        amount,
        reason,
        initiatedBy: adminId || 'system',
        remainingBalance: payment.amount - (totalRefunded + amount)
      });
      
      return {
        success: true,
        refundId: refundResult.refundId,
        amount,
        order: {
          id: order._id,
          status: order.status
        },
        payment: {
          id: payment._id,
          status: payment.status,
          totalRefunded: totalRefunded + amount,
          remainingBalance: payment.amount - (totalRefunded + amount)
        }
      };
    } catch (error) {
      console.error('Error processing partial refund:', error);
      appInsights.trackException(error, {
        component: 'PaymentRefundController',
        operation: 'processPartialRefund',
        orderId,
        amount
      });
      
      throw error;
    }
  }
  
  /**
   * Get refund history for an order
   * @param {string} orderId - The order ID
   * @returns {Promise<Array>} Refund history
   */
  async getRefundHistory(orderId) {
    try {
      const payment = await Payment.findOne({ order: orderId });
      
      if (!payment) {
        return [];
      }
      
      return payment.refunds.map(refund => ({
        amount: refund.amount,
        reason: refund.reason,
        transactionId: refund.transactionId,
        date: refund.date
      }));
    } catch (error) {
      console.error('Error getting refund history:', error);
      appInsights.trackException(error, {
        component: 'PaymentRefundController',
        operation: 'getRefundHistory',
        orderId
      });
      
      throw error;
    }
  }
}

module.exports = new PaymentRefundController(); 