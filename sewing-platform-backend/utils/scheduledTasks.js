const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

/**
 * Check wishlist items for price changes and notify users
 */
const checkWishlistPriceChanges = async () => {
  try {
    console.log('Running scheduled task: Check wishlist price changes');
    
    // Find all users with items in their wishlist
    const users = await User.find({ 'wishlist.0': { $exists: true } })
      .select('_id wishlist');
    
    for (const user of users) {
      // Get all listing IDs from user's wishlist
      const listingIds = user.wishlist.map(item => item.listingId);
      
      // Get current prices for these listings
      const listings = await Listing.find({
        _id: { $in: listingIds },
        status: 'active'
      }).select('_id price title');
      
      // Create a map of current prices
      const currentPrices = {};
      listings.forEach(listing => {
        currentPrices[listing._id.toString()] = {
          price: listing.price,
          title: listing.title
        };
      });
      
      // Check for price changes and create notifications
      for (const wishlistItem of user.wishlist) {
        const listingId = wishlistItem.listingId.toString();
        const listing = currentPrices[listingId];
        
        // Skip if listing is no longer active
        if (!listing) continue;
        
        // Check if notification for price change is enabled and if price has changed
        if (
          wishlistItem.notifyOnPriceChange && 
          wishlistItem.initialPrice && 
          listing.price < wishlistItem.initialPrice
        ) {
          // Create price drop notification
          const priceChange = wishlistItem.initialPrice - listing.price;
          const percentChange = (priceChange / wishlistItem.initialPrice) * 100;
          
          const notification = new Notification({
            userId: user._id,
            type: 'wishlist_price_change',
            title: 'Price Drop on Wishlisted Item',
            message: `${listing.title} is now ${priceChange.toFixed(2)} (${percentChange.toFixed(0)}%) cheaper!`,
            relatedId: wishlistItem.listingId,
            relatedType: 'Listing',
            isRead: false
          });
          
          await notification.save();
          
          // Update initial price to current price to avoid duplicate notifications
          wishlistItem.initialPrice = listing.price;
        }
      }
      
      // Save user with updated initial prices
      await user.save();
    }
    
    console.log('Completed wishlist price check task');
  } catch (error) {
    console.error('Error in wishlist price check task:', error);
  }
};

/**
 * Process saved searches and notify users of new matching items
 */
const processSavedSearches = async () => {
  try {
    console.log('Running scheduled task: Process saved searches');
    
    // Find users with saved searches enabled for email notifications
    const users = await User.find({
      'savedSearches.emailNotifications.enabled': true,
      'savedSearches.emailNotifications.frequency': { $ne: 'never' }
    }).select('_id savedSearches');
    
    for (const user of users) {
      // Process each saved search with notifications enabled
      for (const search of user.savedSearches) {
        // Skip if notifications are not enabled
        if (!search.emailNotifications?.enabled) continue;
        
        // Skip if search was checked recently based on frequency
        const now = new Date();
        if (search.lastRun) {
          const lastRunDate = new Date(search.lastRun);
          
          if (search.emailNotifications.frequency === 'daily' && 
              now - lastRunDate < 24 * 60 * 60 * 1000) {
            continue;
          }
          
          if (search.emailNotifications.frequency === 'weekly' && 
              now - lastRunDate < 7 * 24 * 60 * 60 * 1000) {
            continue;
          }
        }
        
        // Execute the saved search query
        const query = search.query || {};
        query.status = 'active'; // Only active listings
        query.createdAt = { $gt: search.lastRun || 0 }; // Only new listings since last check
        
        const newListings = await Listing.find(query)
          .select('_id title price photos')
          .limit(10); // Limit to 10 new matches
        
        // If new matches found, create a notification
        if (newListings.length > 0) {
          const notification = new Notification({
            userId: user._id,
            type: 'saved_search_results',
            title: `New Matches for "${search.name}"`,
            message: `Found ${newListings.length} new item(s) matching your saved search "${search.name}"`,
            relatedId: search._id,
            relatedType: 'SavedSearch',
            data: {
              searchName: search.name,
              matchCount: newListings.length,
              topMatches: newListings.map(l => ({
                id: l._id,
                title: l.title,
                price: l.price,
                photo: l.photos?.[0] || null
              }))
            },
            isRead: false
          });
          
          await notification.save();
        }
        
        // Update the last run time
        search.lastRun = now;
      }
      
      // Save user with updated lastRun times
      await user.save();
    }
    
    console.log('Completed saved searches task');
  } catch (error) {
    console.error('Error in saved searches task:', error);
  }
};

/**
 * Check wishlist items for price drops and notify users
 */
const checkWishlistPriceDrops = async () => {
  try {
    console.log('Running scheduled task: Check wishlist price drops');
    
    // Find users with wishlist items that have price drop notifications enabled
    const users = await User.find({
      'wishlist.notifyOnPriceChange': true
    }).select('_id wishlist');
    
    let notificationCount = 0;
    
    for (const user of users) {
      // Skip if no wishlist items
      if (!user.wishlist || user.wishlist.length === 0) continue;
      
      // Get all listing IDs from wishlist
      const listingIds = user.wishlist
        .filter(item => item.notifyOnPriceChange)
        .map(item => item.listingId);
      
      if (listingIds.length === 0) continue;
      
      // Fetch current listing prices
      const listings = await Listing.find({
        _id: { $in: listingIds },
        status: 'active'
      }).select('_id title price photos');
      
      // Check each wishlist item for price drops
      for (const wishlistItem of user.wishlist) {
        // Skip if notification is disabled
        if (!wishlistItem.notifyOnPriceChange) continue;
        
        // Find corresponding listing
        const listing = listings.find(l => 
          l._id.toString() === wishlistItem.listingId.toString()
        );
        
        // Skip if listing not found or inactive
        if (!listing) continue;
        
        // Check if price dropped from initial price
        if (wishlistItem.initialPrice && listing.price < wishlistItem.initialPrice) {
          // Calculate price drop percentage
          const dropAmount = wishlistItem.initialPrice - listing.price;
          const dropPercentage = (dropAmount / wishlistItem.initialPrice) * 100;
          
          // Only notify for significant drops (more than 5%)
          if (dropPercentage >= 5) {
            // Create notification
            const notification = new Notification({
              userId: user._id,
              type: 'wishlist_price_change',
              title: 'Price Drop Alert!',
              message: `${listing.title} price dropped by ${dropPercentage.toFixed(0)}% (${dropAmount.toFixed(2)})`,
              relatedId: listing._id,
              relatedType: 'Listing',
              actionLink: `/listings/${listing._id}`,
              actionText: 'View Listing',
              data: {
                listingId: listing._id,
                oldPrice: wishlistItem.initialPrice,
                newPrice: listing.price,
                dropAmount: dropAmount,
                dropPercentage: dropPercentage,
                title: listing.title,
                image: listing.photos && listing.photos.length > 0 ? listing.photos[0] : null
              }
            });
            
            await notification.save();
            notificationCount++;
            
            // Update initial price to current price
            wishlistItem.initialPrice = listing.price;
          }
        }
      }
      
      // Save user with updated initial prices
      await user.save();
    }
    
    console.log(`Completed wishlist price drops task. Created ${notificationCount} notifications.`);
  } catch (error) {
    console.error('Error in wishlist price drops task:', error);
  }
};

module.exports = {
  checkWishlistPriceChanges,
  processSavedSearches,
  checkWishlistPriceDrops
}; 