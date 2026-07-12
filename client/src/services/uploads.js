import api from './api';

export async function uploadImage(file, onProgress) {
  const form = new FormData();
  form.append('image', file);
  const res = await api.post('/uploads/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (evt) => onProgress(Math.round((evt.loaded / evt.total) * 100))
      : undefined,
  });
  return res.data; // { url, publicId }
}

export async function uploadImages(files, onProgress) {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append('images', file));
  const res = await api.post('/uploads/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (evt) => onProgress(Math.round((evt.loaded / evt.total) * 100))
      : undefined,
  });
  return res.data.images; // [{ url, publicId }]
}
