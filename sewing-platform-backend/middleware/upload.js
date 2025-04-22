const multer = require('multer');
const path = require('path');

// Configure storage - using memory storage for better processing with sharp
const storage = multer.memoryStorage();

// File filter: only images
function fileFilter(req, file, cb) {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type, only jpeg, jpg, png, gif image formats are allowed'), false);
	}
}

// Create multer instance
const upload = multer({
	storage,
	fileFilter,
	limits: { 
		fileSize: 10 * 1024 * 1024,  // 10MB max
		files: 10  // Maximum 10 files per request
	}
});

module.exports = upload;
