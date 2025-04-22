const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');

// @route GET /api/analytics/seller/summary
// @desc Get seller's dashboard summary (total sales, order count, avg rating)
// @access Private (Seller only)
router.get('/seller/summary', [auth, checkRole('seller')], async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get total sales amount and order count
    const salesData = await Order.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId), status: { $in: ['completed', 'delivered'] } } },
      { $group: {
        _id: null,
        totalSales: { $sum: '$price.total' },
        orderCount: { $sum: 1 }
      }}
    ]);

    // Get average seller rating
    const sellerData = await User.findById(sellerId, 'rating');
    
    // Get most popular listings
    const popularListings = await Order.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
      { $group: { 
        _id: '$listingId', 
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$price.total' }
      }},
      { $sort: { totalOrders: -1 } },
      { $limit: 5 }
    ]);

    // Fetch listing details for popular listings
    const listingIds = popularListings.map(item => item._id);
    const listingDetails = await Listing.find({ _id: { $in: listingIds } }, 'title mainPhoto');
    
    // Combine the data
    const enhancedPopularListings = popularListings.map(item => {
      const listingDetail = listingDetails.find(l => l._id.toString() === item._id.toString());
      return {
        listingId: item._id,
        title: listingDetail ? listingDetail.title : 'Unknown Listing',
        mainPhoto: listingDetail ? listingDetail.mainPhoto : 'default-listing.jpg',
        totalOrders: item.totalOrders,
        totalRevenue: item.totalRevenue
      };
    });

    // Monthly sales data for charts
    const monthlyData = await Order.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId), status: { $in: ['completed', 'delivered'] } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        sales: { $sum: '$price.total' },
        orders: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalSales: salesData.length > 0 ? salesData[0].totalSales : 0,
          orderCount: salesData.length > 0 ? salesData[0].orderCount : 0,
          averageRating: sellerData.rating ? sellerData.rating.average : 0,
          reviewCount: sellerData.rating ? sellerData.rating.count : 0
        },
        popularListings: enhancedPopularListings,
        monthlyData
      }
    });
  } catch (error) {
    console.error('Error getting seller analytics:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/analytics/seller/sales
// @desc Get detailed sales data with filters
// @access Private (Seller only)
router.get('/seller/sales', [
  auth, 
  checkRole('seller')
], async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { startDate, endDate, category } = req.query;
    
    let matchQuery = { sellerId: mongoose.Types.ObjectId(sellerId) };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get all orders with optional filters
    const salesData = await Order.aggregate([
      { $match: matchQuery },
      { $lookup: {
        from: 'listings',
        localField: 'listingId',
        foreignField: '_id',
        as: 'listing'
      }},
      { $unwind: '$listing' },
      // Filter by category if provided
      ...(category ? [{ $match: { 'listing.category': category } }] : []),
      { $group: {
        _id: { 
          status: '$status',
          category: '$listing.category'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$price.total' }
      }},
      { $sort: { '_id.category': 1, '_id.status': 1 } }
    ]);
    
    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error getting detailed sales data:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/analytics/seller/customers
// @desc Get customer demographics and insights
// @access Private (Seller only)
router.get('/seller/customers', [auth, checkRole('seller')], async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Get repeat customer data
    const customerData = await Order.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
      { $group: {
        _id: '$buyerId',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$price.total' },
        firstOrder: { $min: '$createdAt' },
        lastOrder: { $max: '$createdAt' }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'buyer'
      }},
      { $unwind: '$buyer' },
      { $project: {
        buyerId: '$_id',
        name: { $concat: ['$buyer.firstName', ' ', '$buyer.lastName'] },
        email: '$buyer.email',
        orderCount: 1,
        totalSpent: 1,
        firstOrder: 1,
        lastOrder: 1,
        daysSinceLastOrder: { 
          $dateDiff: { 
            startDate: '$lastOrder', 
            endDate: '$$NOW', 
            unit: 'day' 
          } 
        }
      }},
      { $sort: { totalSpent: -1 } },
      { $limit: 20 }
    ]);
    
    // Calculate customer retention metrics
    const retentionData = {
      totalCustomers: customerData.length,
      repeatCustomers: customerData.filter(c => c.orderCount > 1).length,
      repeatCustomerPercentage: customerData.length > 0 
        ? (customerData.filter(c => c.orderCount > 1).length / customerData.length * 100).toFixed(1) 
        : 0
    };
    
    res.json({
      success: true,
      data: {
        topCustomers: customerData,
        retention: retentionData
      }
    });
  } catch (error) {
    console.error('Error getting customer analytics:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/analytics/seller/inventory
// @desc Get inventory analytics and insights
// @access Private (Seller only)
router.get('/seller/inventory', [auth, checkRole('seller')], async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Get inventory summary
    const inventorySummary = await InventoryItem.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
      { $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$cost', '$stock'] } },
        averageStock: { $avg: '$stock' },
        lowStockItems: { $sum: { $cond: [{ $lte: ['$stock', '$threshold'] }, 1, 0] } },
        outOfStockItems: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
        inactiveItems: { $sum: { $cond: [{ $eq: ['$active', false] }, 1, 0] } }
      }}
    ]);
    
    // Get category breakdown
    const categoryBreakdown = await InventoryItem.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        value: { $sum: { $multiply: ['$cost', '$stock'] } },
        avgStock: { $avg: '$stock' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Get low stock items
    const lowStockItems = await InventoryItem.find({ 
      sellerId: sellerId,
      stock: { $lte: '$threshold', $gt: 0 }
    })
    .select('name stock threshold category photo')
    .sort({ stock: 1 })
    .limit(10);
    
    // Get out of stock items
    const outOfStockItems = await InventoryItem.find({
      sellerId: sellerId,
      stock: 0,
      active: true
    })
    .select('name threshold category photo')
    .limit(10);
    
    // Get inventory movement - last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inventoryMovement = await InventoryItem.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
      { $unwind: '$stockHistory' },
      { $match: { 'stockHistory.date': { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: '$stockHistory.action',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$stockHistory.quantity' }
      }},
      { $sort: { totalQuantity: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        summary: inventorySummary.length > 0 ? inventorySummary[0] : {
          totalItems: 0,
          totalValue: 0,
          averageStock: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          inactiveItems: 0
        },
        categoryBreakdown,
        lowStockItems,
        outOfStockItems,
        inventoryMovement
      }
    });
  } catch (error) {
    console.error('Error getting inventory analytics:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/analytics/seller/performance
// @desc Get detailed seller performance metrics
// @access Private (Seller only)
router.get('/seller/performance', [auth, checkRole('seller')], async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { period = '30days' } = req.query;
    
    // Define time period
    const startDate = new Date();
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2000); // Far enough back to capture all data
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get order completion metrics
    const orderMetrics = await Order.aggregate([
      { $match: { 
        sellerId: mongoose.Types.ObjectId(sellerId),
        createdAt: { $gte: startDate }
      }},
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$price.total' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Calculate order completion rate
    const orderStatuses = {};
    let totalOrders = 0;
    let totalRevenue = 0;
    
    orderMetrics.forEach(metric => {
      orderStatuses[metric._id] = metric.count;
      totalOrders += metric.count;
      totalRevenue += metric.revenue;
    });
    
    const completedOrders = orderStatuses.completed || 0;
    const cancelledOrders = orderStatuses.canceled || 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders * 100).toFixed(1) : 0;
    
    // Get average order processing time
    const orderProcessingTime = await Order.aggregate([
      { $match: { 
        sellerId: mongoose.Types.ObjectId(sellerId),
        status: { $in: ['completed', 'delivered'] },
        createdAt: { $gte: startDate }
      }},
      { $lookup: {
        from: 'listings',
        localField: 'listingId',
        foreignField: '_id',
        as: 'listing'
      }},
      { $unwind: '$listing' },
      { $project: {
        processTime: { 
          $dateDiff: { 
            startDate: '$createdAt', 
            endDate: { 
              $cond: [
                { $eq: ['$status', 'completed'] },
                '$updatedAt',
                '$delivery.actualDelivery'
              ]
            }, 
            unit: 'day' 
          } 
        },
        category: '$listing.category'
      }},
      { $group: {
        _id: null,
        averageProcessingDays: { $avg: '$processTime' },
        minProcessingDays: { $min: '$processTime' },
        maxProcessingDays: { $max: '$processTime' }
      }}
    ]);
    
    // Get rating metrics
    const sellerData = await User.findById(sellerId, 'rating');
    const ratingMetrics = sellerData.rating || { 
      average: 0, 
      count: 0,
      aspectAverages: {
        quality: 0,
        communication: 0,
        delivery: 0,
        valueForMoney: 0
      }
    };
    
    // Get revenue by category
    const categoryRevenue = await Order.aggregate([
      { $match: { 
        sellerId: mongoose.Types.ObjectId(sellerId),
        status: { $in: ['completed', 'delivered'] },
        createdAt: { $gte: startDate }
      }},
      { $lookup: {
        from: 'listings',
        localField: 'listingId',
        foreignField: '_id',
        as: 'listing'
      }},
      { $unwind: '$listing' },
      { $group: {
        _id: '$listing.category',
        revenue: { $sum: '$price.total' },
        orders: { $sum: 1 },
        averageOrderValue: { $avg: '$price.total' }
      }},
      { $sort: { revenue: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        period,
        orderMetrics: {
          totalOrders,
          totalRevenue,
          completionRate: parseFloat(completionRate),
          cancellationRate: parseFloat(cancellationRate),
          ordersByStatus: orderMetrics
        },
        processingTime: orderProcessingTime.length > 0 ? {
          average: Math.round(orderProcessingTime[0].averageProcessingDays * 10) / 10,
          min: orderProcessingTime[0].minProcessingDays,
          max: orderProcessingTime[0].maxProcessingDays
        } : { average: 0, min: 0, max: 0 },
        ratingMetrics,
        categoryPerformance: categoryRevenue
      }
    });
  } catch (error) {
    console.error('Error getting seller performance metrics:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route GET /api/analytics/seller/customers/demographics
// @desc Get customer demographic data
// @access Private (Seller only)
router.get('/seller/customers/demographics', [auth, checkRole('seller')], async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Get buyer location data
    const locationData = await Order.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
      { $lookup: {
        from: 'users',
        localField: 'buyerId',
        foreignField: '_id',
        as: 'buyer'
      }},
      { $unwind: '$buyer' },
      { $group: {
        _id: {
          country: '$delivery.deliveryAddress.country',
          state: '$delivery.deliveryAddress.state'
        },
        customerCount: { $addToSet: '$buyerId' },
        orderCount: { $sum: 1 },
        revenue: { $sum: '$price.total' }
      }},
      { $project: {
        country: '$_id.country',
        state: '$_id.state',
        customerCount: { $size: '$customerCount' },
        orderCount: 1,
        revenue: 1
      }},
      { $sort: { orderCount: -1 } }
    ]);
    
    // Process the data for geographic visualization
    const countries = {};
    locationData.forEach(location => {
      if (!location.country) return;
      
      if (!countries[location.country]) {
        countries[location.country] = {
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          states: []
        };
      }
      
      countries[location.country].totalOrders += location.orderCount;
      countries[location.country].totalRevenue += location.revenue;
      countries[location.country].totalCustomers += location.customerCount;
      
      if (location.state) {
        countries[location.country].states.push({
          state: location.state,
          orders: location.orderCount,
          revenue: location.revenue,
          customers: location.customerCount
        });
      }
    });
    
    // Calculate customer retention data
    const retentionData = await Order.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
      { $group: {
        _id: '$buyerId',
        firstOrder: { $min: '$createdAt' },
        lastOrder: { $max: '$createdAt' },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$price.total' }
      }},
      { $project: {
        daysBetweenFirstAndLastOrder: { 
          $dateDiff: { 
            startDate: '$firstOrder', 
            endDate: '$lastOrder', 
            unit: 'day' 
          } 
        },
        totalOrders: 1,
        totalSpent: 1,
        isRepeatCustomer: { $gt: ['$totalOrders', 1] }
      }},
      { $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        repeatCustomers: { $sum: { $cond: ['$isRepeatCustomer', 1, 0] } },
        averageOrdersPerCustomer: { $avg: '$totalOrders' },
        averageLifetimeValue: { $avg: '$totalSpent' },
        averageRetentionDays: { $avg: {
          $cond: [
            '$isRepeatCustomer',
            '$daysBetweenFirstAndLastOrder',
            0
          ]
        }}
      }}
    ]);
    
    res.json({
      success: true,
      data: {
        geographicDistribution: countries,
        customerRetention: retentionData.length > 0 ? {
          totalCustomers: retentionData[0].totalCustomers,
          repeatCustomers: retentionData[0].repeatCustomers,
          repeatRate: (retentionData[0].repeatCustomers / retentionData[0].totalCustomers * 100).toFixed(1),
          averageOrdersPerCustomer: Math.round(retentionData[0].averageOrdersPerCustomer * 10) / 10,
          averageLifetimeValue: Math.round(retentionData[0].averageLifetimeValue * 100) / 100,
          averageRetentionDays: Math.round(retentionData[0].averageRetentionDays)
        } : {
          totalCustomers: 0,
          repeatCustomers: 0,
          repeatRate: 0,
          averageOrdersPerCustomer: 0,
          averageLifetimeValue: 0,
          averageRetentionDays: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting customer demographics:', error);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router; 