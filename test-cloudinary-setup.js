#!/usr/bin/env node

/**
 * Cloudinary Setup Test Tool
 * This script helps you verify your Cloudinary configuration
 */

require('dotenv').config()
const { cloudinary, testCloudinaryConnection } = require('./backend/config/cloudinary')

async function testCloudinarySetup() {
  console.log('🌤️  Testing Cloudinary Setup for Resume Uploads')
  console.log('=' .repeat(50))
  
  // Check environment variables
  console.log('\n📋 Environment Variables:')
  console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET'}`)
  console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET'}`)
  console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET'}`)
  
  // Test connection
  console.log('\n🔗 Testing Connection:')
  const isConnected = await testCloudinaryConnection()
  
  if (isConnected) {
    console.log('✅ Cloudinary connection successful!')
    
    // Test upload folder structure
    try {
      console.log('\n📁 Testing Upload Folder:')
      const folderResult = await cloudinary.api.create_folder('placement-portal/resumes')
      console.log('✅ Upload folder ready:', folderResult.path)
    } catch (error) {
      if (error.http_code === 400 && error.message.includes('already exists')) {
        console.log('✅ Upload folder already exists')
      } else {
        console.log('⚠️  Folder creation warning:', error.message)
      }
    }
    
    console.log('\n🎉 Cloudinary is ready for resume uploads!')
    console.log('\nNext steps:')
    console.log('1. Start your backend server: npm run server')
    console.log('2. Test upload at: http://localhost:5001/api/upload/test')
    console.log('3. Upload a resume through your frontend')
    
  } else {
    console.log('❌ Cloudinary connection failed!')
    console.log('\n🔧 Setup Instructions:')
    console.log('1. Go to https://cloudinary.com and create a free account')
    console.log('2. Get your credentials from the dashboard')
    console.log('3. Update your .env file with actual values:')
    console.log('   CLOUDINARY_CLOUD_NAME=your-actual-cloud-name')
    console.log('   CLOUDINARY_API_KEY=your-actual-api-key')
    console.log('   CLOUDINARY_API_SECRET=your-actual-api-secret')
    console.log('4. Restart your server and try again')
  }
  
  console.log('\n' + '=' .repeat(50))
}

// Run the test
testCloudinarySetup().catch(error => {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
})