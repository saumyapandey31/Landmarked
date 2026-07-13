const express = require("express");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadBuffer } = require("../services/cloudinary");

const router = express.Router();

/**
 * Upload single image
 */
router.post(
  "/image",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      const result = await uploadBuffer(
        req.file.buffer,
        "landmarked/images"
      );

      return res.status(201).json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: "Image upload failed",
      });
    }
  }
);

/**
 * Upload multiple images
 */
router.post(
  "/images",
  protect,
  upload.array("images", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "No images uploaded",
        });
      }

      const uploaded = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadBuffer(
            file.buffer,
            "landmarked/scrapbook"
          );

          return {
            url: result.secure_url,
            publicId: result.public_id,
          };
        })
      );

      return res.status(201).json({
        images: uploaded,
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: "Image upload failed",
      });
    }
  }
);

module.exports = router;