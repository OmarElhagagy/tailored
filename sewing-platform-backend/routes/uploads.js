const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const path = require('path');
const fs = require('fs');
const uploadMiddleware = require('../middleware/upload');
const imageProcessor = require('../middleware/imageProcessor');
const UploadedFile = require('../models/UploadedFile');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');

// File upload utility with content type routing
const handleUpload = (fieldName) => (req, res, next) => {
  // Add content type to the request to help with file routing
  const contentType = req.body.contentType || 'other';
  req.contentType = contentType;
  
  uploadMiddleware.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        errors: [{ 
          message: err.message || 'File upload error',
          code: err.code 
        }]
      });
    }
    next();
  });
};

// @route POST /api/uploads
// @desc Upload a file
// @access Private
router.post('/', [
  auth,
  [
    check('contentType', 'Content type is required').isIn([
      'profile_image', 'listing_image', 'product_image', 'message_attachment', 
      'order_photo', 'return_evidence', 'dispute_evidence', 'custom_requirements'
    ]),
    check('relatedId', 'Related ID must be a valid MongoDB ID if provided').optional().isMongoId(),
    check('relatedModel', 'Related model must be valid if ID is provided')
      .if(check('relatedId').exists())
      .isIn(['User', 'Listing', 'Order', 'Message'])
  ],
  handleUpload('file'),
  imageProcessor // Apply image optimization middleware
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (!req.file) {
      return res.status(400).json({ errors: [{ message: 'No file uploaded' }] });
    }
    
    const { contentType, relatedId, relatedModel, isPublic = true } = req.body;
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    
    // Verify user has permission to upload for this related entity
    if (relatedId && relatedModel) {
      switch (relatedModel) {
        case 'User':
          // User can only upload to their own profile
          if (relatedId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
              errors: [{ message: 'Not authorized to upload to this user profile' }] 
            });
          }
          break;
          
        case 'Listing':
          // Verify user owns this listing
          const listing = await Listing.findById(relatedId);
          if (!listing || (listing.sellerId.toString() !== req.user.id && req.user.role !== 'admin')) {
            return res.status(403).json({ 
              errors: [{ message: 'Not authorized to upload to this listing' }] 
            });
          }
          break;
          
        case 'Order':
          // Verify user is buyer or seller of this order
          const order = await Order.findById(relatedId);
          if (!order || (
              order.buyerId.toString() !== req.user.id && 
              order.sellerId.toString() !== req.user.id && 
              req.user.role !== 'admin'
            )) {
            return res.status(403).json({ 
              errors: [{ message: 'Not authorized to upload to this order' }] 
            });
          }
          break;
      }
    }
    
    // Get file information
    const file = req.file;
    const isImage = file.mimetype.startsWith('image/');
    
    // Generate URLs for the file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}${file.path.replace(path.join(__dirname, '..'), '')}`;
    const thumbnailUrl = file.thumbnailPath ? 
      `${baseUrl}${file.thumbnailPath.replace(path.join(__dirname, '..'), '')}` : null;
    
    // Create file record in database
    const uploadedFile = new UploadedFile({
      filename: path.basename(file.path),
      originalFilename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: fileUrl,
      thumbnailUrl: thumbnailUrl,
      contentType,
      uploadedBy: req.user.id,
      relatedModel,
      relatedId,
      isPublic,
      tags,
      metadata: {
        isImage,
        width: isImage ? file.width : null,
        height: isImage ? file.height : null
      }
    });
    
    await uploadedFile.save();
    
    // Update related entities with the new file
    if (relatedId && relatedModel) {
      switch (relatedModel) {
        case 'User':
          if (contentType === 'profile_image') {
            await User.findByIdAndUpdate(relatedId, { 
              profileImage: fileUrl 
            });
          }
          break;
          
        case 'Listing':
          if (contentType === 'listing_image' || contentType === 'product_image') {
            await Listing.findByIdAndUpdate(relatedId, { 
              $push: { images: { 
                url: fileUrl, 
                thumbnailUrl, 
                uploadedAt: new Date() 
              }} 
            });
          }
          break;
          
        case 'Order':
          // Handle order photo uploads
          if (['order_photo', 'return_evidence', 'dispute_evidence'].includes(contentType)) {
            await Order.findByIdAndUpdate(relatedId, {
              $push: {
                attachments: {
                  type: contentType,
                  url: fileUrl,
                  thumbnailUrl,
                  uploadedBy: req.user.id,
                  uploadedAt: new Date()
                }
              }
            });
          }
          break;
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        fileId: uploadedFile._id,
        url: fileUrl,
        thumbnailUrl,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ errors: [{ message: 'Server error during file upload' }] });
  }
});

// @route GET /api/uploads/:id
// @desc Get uploaded file by ID
// @access Private
router.get('/:id', auth, async (req, res) => {
  try {
    const fileId = req.params.id;
    
    const uploadedFile = await UploadedFile.findById(fileId);
    
    if (!uploadedFile) {
      return res.status(404).json({ errors: [{ message: 'File not found' }] });
    }
    
    // Check permissions
    if (!uploadedFile.isPublic && 
        uploadedFile.uploadedBy.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ errors: [{ message: 'Not authorized to access this file' }] });
    }
    
    res.json({
      success: true,
      data: uploadedFile
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'File not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

// @route DELETE /api/uploads/:id
// @desc Delete an uploaded file
// @access Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const fileId = req.params.id;
    
    const uploadedFile = await UploadedFile.findById(fileId);
    
    if (!uploadedFile) {
      return res.status(404).json({ errors: [{ message: 'File not found' }] });
    }
    
    // Check if user owns this file or is admin
    if (uploadedFile.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ errors: [{ message: 'Not authorized to delete this file' }] });
    }
    
    // Delete the file from storage
    if (fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
    
    // Delete thumbnail if it exists
    if (uploadedFile.thumbnailUrl) {
      const thumbnailPath = uploadedFile.thumbnailUrl.split('/uploads/')[1];
      const fullThumbnailPath = path.join(__dirname, '../uploads', thumbnailPath);
      
      if (fs.existsSync(fullThumbnailPath)) {
        fs.unlinkSync(fullThumbnailPath);
      }
    }
    
    // Remove file reference from related entity
    if (uploadedFile.relatedId && uploadedFile.relatedModel) {
      switch (uploadedFile.relatedModel) {
        case 'User':
          if (uploadedFile.contentType === 'profile_image') {
            await User.findByIdAndUpdate(uploadedFile.relatedId, { 
              $unset: { profileImage: "" } 
            });
          }
          break;
          
        case 'Listing':
          if (['listing_image', 'product_image'].includes(uploadedFile.contentType)) {
            await Listing.findByIdAndUpdate(uploadedFile.relatedId, { 
              $pull: { images: { url: uploadedFile.url } } 
            });
          }
          break;
          
        case 'Order':
          if (['order_photo', 'return_evidence', 'dispute_evidence'].includes(uploadedFile.contentType)) {
            await Order.findByIdAndUpdate(uploadedFile.relatedId, {
              $pull: { attachments: { url: uploadedFile.url } }
            });
          }
          break;
      }
    }
    
    // Delete file record from database
    await uploadedFile.remove();
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ message: 'File not found' }] });
    }
    
    res.status(500).json({ errors: [{ message: 'Server error' }] });
  }
});

module.exports = router; 