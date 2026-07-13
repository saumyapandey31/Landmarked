const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an image buffer to Cloudinary
 */
function uploadBuffer(buffer, folder = "landmarked") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Upload multiple image buffers
 */
async function uploadBuffers(buffers, folder = "landmarked") {
  return Promise.all(
    buffers.map((buffer) => uploadBuffer(buffer, folder))
  );
}

/**
 * Delete image
 */
async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

module.exports = {
  cloudinary,
  uploadBuffer,
  uploadBuffers,
  deleteImage,
};