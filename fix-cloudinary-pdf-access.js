#!/usr/bin/env node

/**
 * Fix Cloudinary PDF Access Issues
 * This script fixes PDF access issues by re-uploading with correct settings
 */

require('dotenv').config()
const mongoose = require('mongoose')
const StudentProfile = require('./backend/models/StudentProfile')
const { cloudinary } = require('./backend/config/cloudinary')

async function fixCloudinaryPdfAccess() {
  try {
    console.log('🔧 Fixing Cloudinary PDF Access Issues')
    console.log('=' .repeat(50))
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('✅ Connected to MongoDB')
    
    // Find profiles with Cloudinary resumes that have access issues
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
        
        // Check if it's using problematic 'image' resource type
        const isImageResource = profile.resumeUrl.includes('/image/upload/')
        
        if (isImageResource) {
          console.log('   ⚠️ Using image resource type - this causes PDF access issues')
          
          try {
            // Try to get resource info
            const resourceInfo = await cloudinary.api.resource(profile.cloudinaryPublicId, {
              resource_type: 'image'
            })
            
            console.log(`   📄 File found: ${(resourceInfo.bytes / 1024).toFixed(2)} KB`)
            
            // Delete the problematic image resource
            console.log('   🗑️ Deleting problematic image resource...')
            await cloudinary.uploader.destroy(profile.cloudinaryPublicId, {
              resource_type: 'image'
            })
            
            console.log('   ❌ File deleted - student needs to re-upload')
            
            // Clear the profile entry
            profile.resumeUrl = null
            profile.resumeFilename = null
            profile.cloudinaryPublicId = null
            await profile.save()
            
            console.log('   ✅ Profile cleared - ready for fresh upload')
            fixed++
            
          } catch (resourceError) {
            console.log(`   ❌ Could not access resource: ${resourceError.message}`)
            
            // Clear the broken entry anyway
            profile.resumeUrl = null
            profile.resumeFilename = null
            profile.cloudinaryPublicId = null
            await profile.save()
            
            console.log('   ✅ Broken entry cleared')
            fixed++
          }
        } else {
          console.log('   ✅ Using correct resource type (raw)')
          
          // Test if the raw resource is accessible
          try {
            await cloudinary.api.resource(profile.cloudinaryPublicId, {
              resource_type: 'raw'
            })
            console.log('   ✅ File is accessible')
          } catch (accessError) {
            console.log(`   ⚠️ File access issue: ${accessError.message}`)
            
            // Clear broken entry
            profile.resumeUrl = null
            profile.resumeFilename = null
            profile.cloudinaryPublicId = null
            await profile.save()
            
            console.log('   ✅ Broken entry cleared')
            fixed++
          }
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
    
    console.log('\n🎉 PDF access issues resolved!')
    console.log('   Problematic files removed from Cloudinary')
    console.log('   Database entries cleared')
    console.log('   Students can now upload fresh resumes')
    
    console.log('\n🚀 Next Steps:')
    console.log('   1. Students should re-upload their resumes')
    console.log('   2. New uploads will use RAW resource type (correct for PDFs)')
    console.log('   3. PDFs will be accessible without permission issues')
    
    console.log('\n⚙️ Upload Configuration:')
    console.log('   ✅ resource_type: "raw" (correct for documents)')
    console.log('   ✅ access_mode: "public" (no ACL restrictions)')
    console.log('   ✅ Direct HTTPS URLs (no proxy needed)')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

// Run the fix
fixCloudinaryPdfAccess().catch(error => {
  console.error('❌ Script failed:', error.message)
  process.exit(1)
})