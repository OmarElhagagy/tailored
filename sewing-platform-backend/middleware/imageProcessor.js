const sharp = require('sharp');
const path = require('path');
const cloudStorage = require('../utils/cloudStorage');

/**
 * Middleware to process and optimize uploaded images
 * - Resizes images to standard dimensions
 * - Converts to WebP format for better compression
 * - Creates thumbnails for faster loading
 * - Uploads to Azure Blob Storage
 */
const processImage = async (req, res, next) => {
  // Skip if no file was uploaded
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    const processedFiles = [];

    // Process each file
    for (const file of files) {
      if (!file) continue;
      
      // Skip non-image files
      if (!file.mimetype.startsWith('image/')) {
        // For non-image files, upload directly to cloud storage
        if (file.buffer) {
          const uploadResult = await cloudStorage.uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            { folder: req.contentType || 'other' }
          );
          
          const processedFile = {
            ...file,
            path: uploadResult.blobPath,
            url: uploadResult.url,
            size: uploadResult.size
          };
          
          processedFiles.push(processedFile);
        } else {
          processedFiles.push(file);
        }
        continue;
      }

      // For images, optimize before uploading
      
      // Create optimized version
      const optimizedBuffer = await sharp(file.buffer)
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();
      
      // Create thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .resize({
          width: 300,
          height: 300,
          fit: 'cover'
        })
        .webp({ quality: 60 })
        .toBuffer();
      
      // Upload optimized image to cloud storage
      const uploadResult = await cloudStorage.uploadFile(
        optimizedBuffer,
        `${path.parse(file.originalname).name}.webp`,
        'image/webp',
        { folder: req.contentType || 'images' }
      );
      
      // Upload thumbnail to cloud storage
      const thumbnailUploadResult = await cloudStorage.uploadFile(
        thumbnailBuffer,
        `${path.parse(file.originalname).name}-thumb.webp`,
        'image/webp',
        { folder: `${req.contentType || 'images'}/thumbnails` }
      );
      
      // Update file object with new information
      const processedFile = {
        ...file,
        path: uploadResult.blobPath,
        url: uploadResult.url,
        thumbnailPath: thumbnailUploadResult.blobPath,
        thumbnailUrl: thumbnailUploadResult.url,
        mimetype: 'image/webp',
        size: uploadResult.size,
        width: sharp(optimizedBuffer).metadata().width,
        height: sharp(optimizedBuffer).metadata().height
      };
      
      processedFiles.push(processedFile);
    }
    
    // Update request with processed files
    if (req.file) {
      req.file = processedFiles[0];
    }
    if (req.files) {
      req.files = processedFiles;
    }
    
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

module.exports = processImage; 