const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Listing = require('../models/Listing');

// @route POST /api/pricing/calculate
// @desc  Calculate order price based on material weight, seller-defined delivery fees and discounts
// @access Private (Any authenticated user)
router.post('/calculate', [
  auth,
  [
    check('listingId', 'Listing ID is required').not().isEmpty(),
    check('quantity', 'Quantity must be a number').isNumeric(),
    check('customizationOptions', 'Customization options must be an object').optional().isObject(),
    check('deliveryMethod', 'Delivery method is required').not().isEmpty()
  ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { listingId, quantity, customizationOptions, deliveryMethod } = req.body;

      const listing = await Listing.findById(listingId).populate('sellerId', 'businessAddress');

      if (!listing) {
        return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
      }

      // Calculate price using the listing's own methods
      const priceCalculation = listing.calculateTotalPrice(quantity, customizationOptions);
      
      // Get seller-defined delivery fee
      const deliveryFee = listing.getDeliveryFee(deliveryMethod);
      
      // Calculate subtotal before discounts
      const subtotalBeforeDiscount = priceCalculation.totalBasePrice + priceCalculation.customizationFee;
      
      // Get seller-defined bulk discount
      const bulkDiscount = listing.getBulkDiscount(quantity, subtotalBeforeDiscount);
      
      // Calculate the final total price (without taxes or other fees)
      const totalPrice = subtotalBeforeDiscount - bulkDiscount + deliveryFee;

      // Get estimated delivery timeframe from the listing
      let estimatedDeliveryDays = null;
      if (listing.deliveryOptions && listing.deliveryOptions.length > 0) {
        const selectedDeliveryOption = listing.deliveryOptions.find(option => option.method === deliveryMethod);
        if (selectedDeliveryOption && selectedDeliveryOption.estimatedDays) {
          estimatedDeliveryDays = `${selectedDeliveryOption.estimatedDays.min}-${selectedDeliveryOption.estimatedDays.max} days`;
        }
      }

      // Return simplified price breakdown with only essential components
      const priceBreakdown = {
        basePrice: priceCalculation.basePrice,
        quantity,
        materialCost: priceCalculation.materialCost,
        priceCalculationMethod: priceCalculation.priceCalculationMethod,
        weightBasedCost: priceCalculation.weightBasedCost,
        customizationFee: priceCalculation.customizationFee,
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        bulkDiscount: parseFloat(bulkDiscount.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        estimatedDeliveryDays
      };
      
      res.json(priceBreakdown);
    } catch(error) {
      console.error(error.message);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ errors: [{ message: 'Listing not found' }] });
      }
      res.status(500).send('Server error');
    }
});

module.exports = router;
