const cloudinary = require('cloudinary').v2; // Use v2 to access the Cloudinary API
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET,
})


// Setting up Multer-Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormats: ['jpg', 'jpeg', 'png'],
    },
  });

module.exports={
    cloudinary,
    storage,
}