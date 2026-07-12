const multer = require("multer");

// Store uploaded files temporarily in memory.
// They will later be uploaded to Cloudinary using
// cloudinary.uploader.upload_stream().
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB
    files: 10,
  },
});

module.exports = upload;