#!/usr/bin/env node

/**
 * Fix PDF Viewing Issues
 * This script re-uploads existing Cloudinary files with better configuration
 */

require('dotenv').config()
const mongoose = require('mongoose')
const StudentProfile = require('./backend/models/StudentProfile')
const { cloudinary } = require('./backend/config/cloudinary')

async function fixPdfViewing() {
  try {
    console.log('🔧 Fixing PDF Viewing Issues')
    console.log('=' .repeat(50))
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('✅ Connected to MongoDB')
    
    // Find profiles with Cloudinary resumes
    const cloudinaryProfiles = await StudentProfile.find({
      resumeUrl: { $regex: /cloudinary\.com/ },
      cloudinaryPublicId: { $exists: true, $ne: null }
    })
    
    console.log(`\n📊 Found ${cloudinaryProfiles.length} Cloudinary files to check`)
    
    if (cloudinaryProfiles.length === 0) {
      console.log('✅ No Cloudinary files to fix!')
      return
    }
    
    let fixed = 0
    let failed = 0
    
    for (const profile of cloudinaryProfiles) {
      try {
        console.log(`\n🔄 Checking user ${profile.userId}...`)
        console.log(`   Current URL: ${profile.resumeUrl}`)
        console.log(`   Public ID: ${profile.cloudinaryPublicId}`)
        
        // Check if it's using 'raw' resource type
        const isRawResource = profile.resumeUrl.includes('/raw/upload/')
        
        if (isRawResource) {
          console.log('   ⚠️ Using raw resource type - needs fixing')
          
          // Get the file from Cloudinary
          console.log('   📥 Downloading from Cloudinary...')
          const fileInfo = await cloudinary.api.resource(profile.cloudinaryPublicId, {
            resource_type: 'raw'
          })
          
          console.log(`   📄 File size: ${(fileInfo.bytes / 1024).toFixed(2)} KB`)
          
          // Delete the old raw resource
          console.log('   🗑️ Deleting old raw resource...')
          await cloudinary.uploader.destroy(profile.cloudinaryPublicId, {
            resource_type: 'raw'
          })
          
          // Re-upload as image resource type for better PDF handling
          console.log('   ☁️ Re-uploading with image resource type...')
          
          // Download the file content
          const https = require('https')
          const fileBuffer = await new Promise((resolve, reject) => {
            https.get(profile.resumeUrl, (response) => {
              const chunks = []
              response.on('data', (chunk) => chunks.push(chunk))
              response.on('end', () => resolve(Buffer.concat(chunks)))
              response.on('error', reject)
            }).on('error', reject)
          })
          
          // Upload with new configuration
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                resource_type: 'image', // Use image for better PDF handling
                folder: 'placement-portal/resumes',
                public_id: `resume_${profile.userId}_${Date.now()}`,
                format: 'pdf',
                type: 'upload',
                access_mode: 'public',
                use_filename: false,
                unique_filename: true,
                overwrite: true,
                invalidate: true,
                flags: 'attachment'
              },
              (error, result) => {
                if (error) {
                  reject(error)
                } else {
                  resolve(result)
                }
              }
            )
            
            uploadStream.end(fileBuffer)
          })
          
          // Update profile with new URL
          profile.resumeUrl = uploadResult.secure_url
          profile.cloudinaryPublicId = uploadResult.public_id
          await profile.save()
          
          console.log(`   ✅ Fixed successfully!`)
          console.log(`   📍 New URL: ${uploadResult.secure_url}`)
          console.log(`   🔧 Resource type: image (better for PDFs)`)
          
          fixed++
        } else {
          console.log('   ✅ Already using proper resource type')
        }
        
      } catch (error) {
        console.log(`   ❌ Fix failed: ${error.message}`)
        failed++
      }
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('📈 Fix Summary:')
    console.log(`   ✅ Successfully fixed: ${fixed}`)
    console.log(`   ❌ Failed fixes: ${failed}`)
    console.log(`   📊 Total checked: ${cloudinaryProfiles.length}`)
    
    if (fixed > 0) {
      console.log('\n🎉 PDF viewing issues fixed!')
      console.log('   PDFs should now open properly in browsers')
      console.log('   Using image resource type for better compatibility')
    }
    
    console.log('\n🧪 Test your PDFs now:')
    console.log('   1. Open test-new-upload.html')
    console.log('   2. Try viewing existing resumes')
    console.log('   3. Upload new resumes (will use new config)')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

// Run the fix
fixPdfViewing().catch(error => {
  console.error('❌ Script failed:', error.message)
  process.exit(1)
})