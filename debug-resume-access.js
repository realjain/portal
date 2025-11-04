#!/usr/bin/env node

/**
 * Debug Resume Access Issues
 * This script helps debug resume serving problems
 */

require('dotenv').config()
const mongoose = require('mongoose')
const StudentProfile = require('./backend/models/StudentProfile')

async function debugResumeAccess() {
  try {
    console.log('🔍 Debugging Resume Access Issues')
    console.log('=' .repeat(50))
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('✅ Connected to MongoDB')
    
    // Find all student profiles with resumes
    const profilesWithResumes = await StudentProfile.find({
      resumeUrl: { $exists: true, $ne: null }
    }).select('userId resumeUrl resumeFilename cloudinaryPublicId')
    
    console.log(`\n📊 Found ${profilesWithResumes.length} profiles with resumes:`)
    
    profilesWithResumes.forEach((profile, index) => {
      console.log(`\n${index + 1}. User ID: ${profile.userId}`)
      console.log(`   Filename: ${profile.resumeFilename || 'N/A'}`)
      console.log(`   URL: ${profile.resumeUrl}`)
      console.log(`   Storage: ${profile.resumeUrl.includes('cloudinary.com') ? '☁️ Cloudinary' : '💾 Local'}`)
      console.log(`   Public ID: ${profile.cloudinaryPublicId || 'N/A'}`)
      
      // Test URL accessibility
      if (profile.resumeUrl.includes('cloudinary.com')) {
        console.log(`   Status: ✅ Should work (Cloudinary URL)`)
      } else {
        console.log(`   Status: ⚠️ May have issues (Local file)`)
      }
    })
    
    // Check for common issues
    console.log('\n🔧 Common Issues Check:')
    
    const cloudinaryCount = profilesWithResumes.filter(p => p.resumeUrl.includes('cloudinary.com')).length
    const localCount = profilesWithResumes.filter(p => !p.resumeUrl.includes('cloudinary.com')).length
    
    console.log(`   Cloudinary files: ${cloudinaryCount}`)
    console.log(`   Local files: ${localCount}`)
    
    if (localCount > 0) {
      console.log('   ⚠️ Local files may cause "Failed to serve resume" errors')
      console.log('   💡 Solution: Re-upload these files to migrate to Cloudinary')
    }
    
    // Test a few URLs
    console.log('\n🌐 Testing URL Access:')
    for (let i = 0; i < Math.min(3, profilesWithResumes.length); i++) {
      const profile = profilesWithResumes[i]
      console.log(`\nTesting: ${profile.resumeUrl}`)
      
      try {
        const fetch = (await import('node-fetch')).default
        const response = await fetch(profile.resumeUrl, { method: 'HEAD' })
        console.log(`   Status: ${response.status} ${response.statusText}`)
        console.log(`   Content-Type: ${response.headers.get('content-type')}`)
        console.log(`   Result: ${response.ok ? '✅ Accessible' : '❌ Not accessible'}`)
      } catch (error) {
        console.log(`   Result: ❌ Error - ${error.message}`)
      }
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('🎯 Recommendations:')
    
    if (localCount > 0) {
      console.log('1. ⚠️ You have local files that may cause serving errors')
      console.log('2. 💡 Ask students to re-upload their resumes to migrate to Cloudinary')
      console.log('3. 🔧 Or manually migrate existing files to Cloudinary')
    }
    
    if (cloudinaryCount > 0) {
      console.log('1. ✅ Cloudinary files should work without issues')
      console.log('2. 🌍 These files are accessible worldwide')
    }
    
    console.log('\n🚀 Next Steps:')
    console.log('1. Test resume access in your frontend')
    console.log('2. Check browser console for specific errors')
    console.log('3. Use test-resume-upload.html to test new uploads')
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

// Run the debug
debugResumeAccess().catch(error => {
  console.error('❌ Script failed:', error.message)
  process.exit(1)
})