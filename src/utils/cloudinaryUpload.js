// cloudinaryUpload.js
export async function uploadToCloudinary(file) {
  if (!file.type.startsWith('video/')) {
    throw new Error('Only video files are allowed for Cloudinary upload');
  }
  const url = 'https://api.cloudinary.com/v1_1/dcje7tu3i/video/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'cloudinary');
  formData.append('resource_type', 'video');
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  return res.json();
}
