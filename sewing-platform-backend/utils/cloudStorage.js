const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const path = require('path');
const crypto = require('crypto');

/**
 * Azure Blob Storage utility for handling file uploads
 */
class CloudStorage {
  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'sewing-platform-uploads';
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.cdnEndpoint = process.env.AZURE_STORAGE_CDN_ENDPOINT;
    
    // Initialize the Blob Service Client
    this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
  }

  /**
   * Initialize the storage container if it doesn't exist
   */
  async init() {
    try {
      await this.containerClient.createIfNotExists({
        access: 'blob' // Public read access for blobs only
      });
      console.log(`Container "${this.containerName}" is ready.`);
    } catch (error) {
      console.error('Error initializing Azure Blob Storage:', error);
      throw error;
    }
  }

  /**
   * Generate a unique filename for uploads
   * @param {string} originalFilename - Original file name
   * @returns {string} - Unique filename
   */
  generateUniqueFilename(originalFilename) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalFilename);
    const basename = path.basename(originalFilename, extension);
    
    return `${basename}-${timestamp}-${randomString}${extension}`;
  }

  /**
   * Upload file to Azure Blob Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalFilename - Original file name
   * @param {string} contentType - File MIME type
   * @param {Object} options - Additional options like folder path
   * @returns {Promise<Object>} - Upload result with URL
   */
  async uploadFile(fileBuffer, originalFilename, contentType, options = {}) {
    try {
      const uniqueFilename = this.generateUniqueFilename(originalFilename);
      const folderPath = options.folder || '';
      const blobPath = folderPath ? `${folderPath}/${uniqueFilename}` : uniqueFilename;
      
      // Get a block blob client
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
      
      // Upload the file
      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });
      
      // Generate URLs
      const blobUrl = blockBlobClient.url;
      const cdnUrl = this.cdnEndpoint 
        ? `https://${this.cdnEndpoint}/${blobPath}`
        : blobUrl;
      
      return {
        filename: uniqueFilename,
        blobPath: blobPath,
        url: cdnUrl || blobUrl,
        size: fileBuffer.length,
        contentType: contentType
      };
    } catch (error) {
      console.error('Error uploading file to Azure Blob Storage:', error);
      throw error;
    }
  }

  /**
   * Get a Shared Access Signature (SAS) URL for a blob
   * @param {string} blobPath - Path to the blob
   * @param {number} expiryMinutes - Minutes until the SAS token expires
   * @returns {Promise<string>} - SAS URL
   */
  async generateSasUrl(blobPath, expiryMinutes = 60) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
      
      // Create a SAS token that expires in `expiryMinutes`
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
      
      const sasToken = await blockBlobClient.generateSasUrl({
        permissions: {
          read: true,
          create: false,
          write: false,
          delete: false,
          tag: false,
          list: false
        },
        expiresOn: expiryTime
      });
      
      return sasToken;
    } catch (error) {
      console.error('Error generating SAS URL:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Azure Blob Storage
   * @param {string} blobPath - Path to the blob
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(blobPath) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
      const response = await blockBlobClient.deleteIfExists();
      
      return response.succeeded;
    } catch (error) {
      console.error('Error deleting file from Azure Blob Storage:', error);
      throw error;
    }
  }
}

module.exports = new CloudStorage(); 