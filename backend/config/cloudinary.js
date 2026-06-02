import { v2 as cloudinary } from 'cloudinary';

let isCloudinaryConfigured = false;

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (
  cloudinaryCloudName && cloudinaryCloudName.trim() !== '' &&
  cloudinaryApiKey && cloudinaryApiKey.trim() !== '' &&
  cloudinaryApiSecret && cloudinaryApiSecret.trim() !== ''
) {
  try {
    cloudinary.config({
      cloud_name: cloudinaryCloudName,
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiSecret
    });
    isCloudinaryConfigured = true;
    console.log('☁️ Cloudinary configured successfully.');
  } catch (error) {
    console.error('⚠️ Cloudinary configuration failed:', error.message);
  }
} else {
  console.log('ℹ️ Cloudinary credentials not fully specified in env. Using Local Disk Storage fallback.');
}

export { cloudinary, isCloudinaryConfigured };
