/**
 * Cloud Storage Utility (Simplified for local development)
 * 
 * This is a placeholder implementation for local development.
 * In production, this would use Azure Blob Storage or another cloud storage service.
 */

const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');

const init = async () => {
  try {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Local storage initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize local storage:', error);
    return false;
  }
};

// Upload a file to local storage
const uploadFile = async (fileBuffer, fileName, contentType) => {
  try {
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);
    
    return {
      url: `/uploads/${fileName}`,
      name: fileName,
      contentType,
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('Error uploading file to local storage:', error);
    throw error;
  }
};

// Get a file from local storage
const getFile = async (fileName) => {
  try {
    const filePath = path.join(uploadDir, fileName);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    return {
      content: fileBuffer,
      name: fileName,
      contentType: getMimeType(fileName),
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('Error retrieving file from local storage:', error);
    throw error;
  }
};

// Delete a file from local storage
const deleteFile = async (fileName) => {
  try {
    const filePath = path.join(uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting file from local storage:', error);
    throw error;
  }
};

// Helper to guess MIME type from file extension
const getMimeType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

module.exports = {
  init,
  uploadFile,
  getFile,
  deleteFile
}; 