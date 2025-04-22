const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Auth route placeholder');
});

// GET /api/listings/search
// @desc Search listings with advanced filters
// @access Public
router.get('/search', async (req, res) => {
  try {
    const {
      query,
      category,
      subCategory,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      sortDir = 'desc',
      deliveryMethod,
      inStock = 'true',
      customizable,
      rating,
      material,
      color,
      maxDeliveryDays,
      sellerRating,
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    // Full text search if query provided
    if (query) {
      filter.$text = { $search: query };
    }
    
    // Category filters
    if (category) {
      filter.category = category;
    }
    
    if (subCategory) {
      filter.subCategory = subCategory;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Delivery method filter
    if (deliveryMethod) {
      filter['deliveryOptions.method'] = deliveryMethod;
    }
    
    // Max delivery days filter
    if (maxDeliveryDays) {
      filter['deliveryOptions.estimatedDays.max'] = { $lte: Number(maxDeliveryDays) };
    }
    
    // Customizable filter
    if (customizable === 'true') {
      filter.customizable = true;
    }
    
    // Rating filter
    if (rating) {
      filter['rating.average'] = { $gte: Number(rating) };
    }
    
    // Seller rating filter
    if (sellerRating) {
      // This requires aggregation to join with users collection
      // Will be handled with lookup pipeline stage below
    }
    
    // Material filter
    if (material) {
      // Handle multiple materials (comma-separated)
      const materials = material.split(',').map(m => m.trim());
      if (materials.length === 1) {
        // Use regex for partial matching instead of exact match
        filter['availableMaterials.name'] = { $regex: material, $options: 'i' };
      } else {
        // For multiple materials, create an $or query with regex for each material
        filter.$or = materials.map(mat => ({
          'availableMaterials.name': { $regex: mat, $options: 'i' }
        }));
      }
    }
    
    // Color filter
    if (color) {
      // Handle multiple colors (comma-separated)
      const colors = color.split(',').map(c => c.trim());
      if (colors.length === 1) {
        filter.colors = color;
      } else {
        filter.colors = { $in: colors };
      }
    }
    
    // In stock filter - if true, only show listings with available inventory
    if (inStock === 'true') {
      // For material_based or weight_based listings, we don't check inventory
      filter.$or = [
        { 'priceCalculation': { $in: ['material_based', 'weight_based'] } },
        { 'inventoryItems': { $size: 0 } }, // No inventory requirements
        {
          $and: [
            { 'inventoryItems': { $exists: true, $ne: [] } },
            { 'inventoryItems': { $not: { $elemMatch: { 'quantity': { $lt: 1 } } } } }
          ]
        }
      ];
    }
    
    // Sorting options
    const sortOptions = {};
    
    switch (sortBy) {
      case 'price':
        sortOptions.price = sortDir === 'asc' ? 1 : -1;
        break;
      case 'date':
        sortOptions.createdAt = sortDir === 'asc' ? 1 : -1;
        break;
      case 'rating':
        sortOptions['rating.average'] = sortDir === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        sortOptions.orderCount = sortDir === 'asc' ? 1 : -1;
        break;
      case 'relevance':
      default:
        if (query) {
          // If text search is used, sort by text score for relevance
          sortOptions.score = { $meta: 'textScore' };
        } else {
          // Default to newest first if no text search
          sortOptions.createdAt = -1;
        }
        break;
    }
    
    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Use aggregation pipeline for more complex joins and filters
    const aggregatePipeline = [
      { $match: filter }
    ];
    
    // Add seller rating filter if needed
    if (sellerRating) {
      aggregatePipeline.push(
        { $lookup: {
          from: 'users',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }},
        { $unwind: '$seller' },
        { $match: { 'seller.rating.average': { $gte: Number(sellerRating) } } }
      );
    } else {
      // Still join with users but without filtering
      aggregatePipeline.push(
        { $lookup: {
          from: 'users',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }},
        { $unwind: '$seller' }
      );
    }
    
    // Add sorting
    if (query && sortBy === 'relevance') {
      aggregatePipeline.push(
        { $addFields: { score: { $meta: "textScore" } } },
        { $sort: { score: -1 } }
      );
    } else {
      aggregatePipeline.push({ $sort: sortOptions });
    }
    
    // Add pagination
    aggregatePipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) }
    );
    
    // Add project stage to shape the output
    aggregatePipeline.push({
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        price: 1,
        photos: 1,
        category: 1,
        subCategory: 1,
        rating: 1,
        materials: 1,
        colors: 1,
        customizable: 1,
        deliveryOptions: 1,
        createdAt: 1,
        sellerName: '$seller.businessName',
        sellerRating: '$seller.rating.average',
        sellerVerified: { $eq: ['$seller.credentialVerificationStatus', 'verified'] }
      }
    });
    
    // Execute the aggregation pipeline
    const listings = await Listing.aggregate(aggregatePipeline);
    
    // Get total count for pagination (run a separate count query)
    const totalQuery = { ...filter };
    let total = await Listing.countDocuments(totalQuery);
    
    // If we have a seller rating filter, we need a more complex count
    if (sellerRating) {
      const countPipeline = [
        { $match: filter },
        { $lookup: {
          from: 'users',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }},
        { $unwind: '$seller' },
        { $match: { 'seller.rating.average': { $gte: Number(sellerRating) } } },
        { $count: 'total' }
      ];
      
      const countResult = await Listing.aggregate(countPipeline);
      total = countResult.length > 0 ? countResult[0].total : 0;
    }
    
    // Enhanced inventory status check for each listing
    const enhancedListings = await Promise.all(listings.map(async listing => {
      // Check inventory status
      let stockStatus = 'in_stock';
      
      if (listing.inventoryItems && listing.inventoryItems.length > 0) {
        // Get current inventory for this listing
        const inventoryIds = listing.inventoryItems.map(item => item.itemId);
        const inventoryItems = await InventoryItem.find({
          _id: { $in: inventoryIds }
        }).select('_id stock threshold');
        
        // Map inventory items to the listing items
        for (const listingItem of listing.inventoryItems) {
          const inventoryItem = inventoryItems.find(item => 
            item._id.toString() === listingItem.itemId.toString()
          );
          
          if (inventoryItem) {
            // Check if stock is less than required quantity per listing
            if (inventoryItem.stock < listingItem.quantity) {
              // If any required item is out of stock, mark as out of stock
              if (inventoryItem.stock === 0) {
                stockStatus = 'out_of_stock';
                break;
              } else {
                // Otherwise mark as low stock
                stockStatus = 'low_stock';
              }
            }
          }
        }
      }
      
      return {
        ...listing,
        stockStatus
      };
    }));
    
    // Get category facets for filters
    const categories = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get material facets for filters
    const materials = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$availableMaterials' },
      { $group: { _id: '$availableMaterials.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    // Get color facets for filters
    const colors = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$colors' },
      { $group: { _id: '$colors', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    // Get price ranges for filters
    const priceRanges = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }}
    ]);
    
    // Get delivery methods for filters
    const deliveryMethods = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$deliveryOptions' },
      { $group: { _id: '$deliveryOptions.method', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get delivery time ranges for filters
    const deliveryTimes = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$deliveryOptions' },
      { $group: { 
        _id: null,
        minDays: { $min: '$deliveryOptions.estimatedDays.min' },
        maxDays: { $max: '$deliveryOptions.estimatedDays.max' }
      }}
    ]);
    
    res.json({
      success: true,
      data: {
        listings: enhancedListings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          categories,
          materials,
          colors,
          priceRanges: priceRanges.length > 0 ? priceRanges[0] : { minPrice: 0, maxPrice: 0, avgPrice: 0 },
          deliveryMethods,
          deliveryTimes: deliveryTimes.length > 0 ? deliveryTimes[0] : { minDays: 1, maxDays: 14 }
        }
      }
    });
  } catch (err) {
    console.error('Error searching listings:', err);
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router;
