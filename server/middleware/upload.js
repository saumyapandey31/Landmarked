const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../services/cloudinary');

// Cloudinary is configured (or not) from env vars in services/cloudinary.js.
// If credentials are missing we fall back to disk-memory storage so local
// dev without a Cloudinary account doesn't hard-crash the upload route —
// uploadImage()/this storage engine will simply be skipped and the caller
// gets a clear 500 with a helpful message instead of a silent failure.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'landmarked/uploads',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1920, height: 1920, crop: 'limit', quality: 'auto' }],
  }),
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
});

module.exports = upload;
