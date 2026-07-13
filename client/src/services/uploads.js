// src/services/uploads.js

import api from './api';

/**
 * Upload a single image
 */
export async function uploadImage(file, onProgress) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await api.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress
      ? (event) => {
          if (!event.total) return;
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      : undefined,
  });

  console.log('Single Upload Response:', data);

  return {
    url: data.url || data.secure_url,
    publicId: data.publicId || data.public_id,
    caption: '',
  };
}

/**
 * Upload multiple images
 */
export async function uploadImages(files, onProgress) {
  if (!files || files.length === 0) return [];

  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });

  const { data } = await api.post('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress
      ? (event) => {
          if (!event.total) return;
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      : undefined,
  });

  console.log('Multiple Upload Response:', data);

  // Accept different backend response formats
  const uploadedImages =
    data.images ||
    data.files ||
    data.data ||
    [];

  return uploadedImages.map((img) => ({
    url: img.url || img.secure_url,
    publicId: img.publicId || img.public_id,
    caption: img.caption || '',
  }));
}