const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const test401Error = async () => {
  try {
    console.log('Testing Cloudinary 401 error scenarios...');
    console.log('Current configuration:');
    console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? `${process.env.CLOUDINARY_API_KEY.substring(0, 6)}...` : 'Not set');
    console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set (hidden)' : 'Not set');
    
    // Test with current credentials
    console.log('\n1. Testing with current credentials...');
    const result = await cloudinary.api.ping();
    console.log('✅ Current credentials are valid');
    
    // Test upload with PDF
    console.log('\n2. Testing PDF upload...');
    const uploadResult = await cloudinary.uploader.upload('data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDQKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjE3NQolJUVPRgo=', {
      resource_type: 'raw',
      public_id: 'test_pdf_401',
      folder: 'resumes'
    });
    
    console.log('✅ PDF upload successful!');
    console.log('Upload URL:', uploadResult.secure_url);
    
    // Clean up
    await cloudinary.uploader.destroy('resumes/test_pdf_401', { resource_type: 'raw' });
    console.log('✅ Test file cleaned up');
    
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    
    if (error.http_code === 401) {
      console.error('\n🔍 401 Unauthorized Error Diagnosis:');
      console.error('- Check if API key and secret are correct');
      console.error('- Verify cloud name is correct');
      console.error('- Ensure credentials have proper permissions');
      console.error('- Check if account is active and not suspended');
    }
    
    console.error('\nFull error details:', error);
  }
};

test401Error();