#!/usr/bin/env node

/**
 * Migrate Local Resume Files to Cloudinary
 * This script migrates existing local resume files to Cloudinary
 */

require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const StudentProfile = require('./backend/models/StudentProfile')
const { cloudinary } = require('./backend/config/cloudinary')

async function migrateLocalToCloudinary() {
  try {
    console.log('🚀 Starting Local to Cloudinary Migration')
    console.log('=' .repeat(50))
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('✅ Connected to MongoDB')
    
    // Find profiles with local resume files
    const localProfiles = await StudentProfile.find({
      resumeUrl: { $exists: true, $ne: null, $not: /cloudinary\.com/ }
    })
    
    console.log(`\n📊 Found ${localProfiles.length} profiles with local files`)
    
    if (localProfiles.length === 0) {
      console.log('✅ No local files to migrate!')
      return
    }
    
    const uploadsDir = path.join(__dirname, 'backend/uploads/resumes')
    let migrated = 0
    let failed = 0
    
    for (const profile of localProfiles) {
      try {
        console.log(`\n🔄 Migrating user ${profile.userId}...`)
        console.log(`   Current URL: ${profile.resumeUrl}`)
        
        // Extract filename from URL
        const filename = profile.resumeUrl.split('/').pop()
        const localFilePath = path.join(uploadsDir, filename)
        
        // Check if local file exists
        if (!fs.existsSync(localFilePath)) {
          console.log(`   ❌ Local file not found: ${filename}`)
          failed++
          continue
        }
        
        // Read file
        const fileBuffer = fs.readFileSync(localFilePath)
        console.log(`   📄 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`)
        
        // Upload to Cloudinary
        console.log('   ☁️ Uploading to Cloudinary...')
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'placement-portal/resumes',
              public_id: `resume_${profile.userId}_${Date.now()}`,
              type: 'upload',
              access_mode: 'public',
              use_filename: false,
              unique_filename: true,
              overwrite: true,
              invalidate: true
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
        
        // Update profile with Cloudinary URL
        profile.resumeUrl = uploadResult.secure_url
        profile.cloudinaryPublicId = uploadResult.public_id
        await profile.save()
        
        console.log(`   ✅ Migrated successfully!`)
        console.log(`   📍 New URL: ${uploadResult.secure_url}`)
        
        // Delete local file
        fs.unlinkSync(localFilePath)
        console.log(`   🗑️ Local file deleted`)
        
        migrated++
        
      } catch (error) {
        console.log(`   ❌ Migration failed: ${error.message}`)
        failed++
      }
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('📈 Migration Summary:')
    console.log(`   ✅ Successfully migrated: ${migrated}`)
    console.log(`   ❌ Failed migrations: ${failed}`)
    console.log(`   📊 Total processed: ${localProfiles.length}`)
    
    if (migrated > 0) {
      console.log('\n🎉 Migration completed successfully!')
      console.log('   All resume files are now stored on Cloudinary')
      console.log('   Students can access their resumes from anywhere')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

// Run the migration
migrateLocalToCloudinary().catch(error => {
  console.error('❌ Script failed:', error.message)
  process.exit(1)
})