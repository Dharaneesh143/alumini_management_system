const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'general';
    let resource_type = 'auto';

    if (file.fieldname === 'resume') folder = 'resumes';
    else if (file.fieldname === 'presentation') folder = 'events';
    else if (file.fieldname === 'file') {
      if (file.mimetype.startsWith('image/')) folder = 'chat/images';
      else if (file.mimetype.startsWith('audio/')) folder = 'chat/voice';
      else folder = 'chat/docs';
    }

    return {
      folder: `alumni_portal/${folder}`,
      allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'png', 'mp3', 'wav'],
      resource_type: 'auto',
    };
  },
});

module.exports = { cloudinary, storage };
