const multer = require('multer');
const path = require('path');

// configure storage location and file name
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, '../uploads/');
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, `${file.fieldname}-${Date.now()}${ext}`);
	}
});

// file filter: only images
function fileFilter(req, file, cb) {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type, only images are allowed'), false);
	}
}

// create multer instance
const upload = multer ({
	storage,
	fileFilter,
	limits: {fileSize: 5 * 1024 * 1024} // 5MB max
});

module.exports = upload;
