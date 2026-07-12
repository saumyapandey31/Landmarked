const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Single image (trip cover, avatar, etc.)
router.post('/image', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
  res.status(201).json({ url: req.file.path, publicId: req.file.filename });
});

// Multiple images at once (scrapbook entries)
router.post('/images', protect, upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No images uploaded' });
  res.status(201).json({
    images: req.files.map((f) => ({ url: f.path, publicId: f.filename })),
  });
});

// Multer errors (file too large, bad type, etc.) land in Express's default
// handler as regular thrown errors — surface them as 400s instead of 500s.
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
  next();
});

module.exports = router;
