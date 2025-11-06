const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testCloudinarySetup = async () => {
  try {
    console.log('Testing Cloudinary configuration...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
    
    // Test connection by getting account details
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Ping result:', result);
    
    // Test upload capabilities
    console.log('Testing upload capabilities...');
    const uploadResult = await cloudinary.uploader.upload('data:text/plain;base64,SGVsbG8gV29ybGQ=', {
      resource_type: 'raw',
      public_id: 'test_file',
      folder: 'test'
    });
    
    console.log('✅ Test upload successful!');
    console.log('Upload URL:', uploadResult.secure_url);
    
    // Clean up test file
    await cloudinary.uploader.destroy('test/test_file', { resource_type: 'raw' });
    console.log('✅ Test file cleaned up');
    
  } catch (error) {
    console.error('❌ Cloudinary setup failed:', error.message);
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
    process.exit(1);
  }
};

testCloudinarySetup();