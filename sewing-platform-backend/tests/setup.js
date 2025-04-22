// Setup for Jest tests
const dotenv = require('dotenv');

// Load environment variables from .env.test if it exists, otherwise from .env
dotenv.config({ path: '.env.test' });

// Set test environment variables if not already set
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || 5001;
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sewing-platform-test';

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
console.error = (...args) => {
  if (process.env.SHOW_ERROR_LOGS === 'true') {
    originalConsoleError(...args);
  }
};

// Global test teardown
afterAll(async () => {
  // Clean up any resources here
}); 