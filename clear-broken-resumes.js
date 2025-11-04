#!/usr/bin/env node

/**
 * Clear Broken Resume Entries
 * This script clears broken resume entries from the database
 */

require('dotenv').config()
const mongoose = require('mongoose')
const StudentProfile = require('./backend/models/StudentProfile')

async function clearBrokenResumes() {
  try {
    console.log('🧹 Clearing Broken Resume Entries')
    console.log('=' .repeat(50))
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('✅ Connected to MongoDB')
    
    // Find profiles with resume URLs
    const profilesWithResumes = await StudentProfile.find({
      resumeUrl: { $exists: true, $ne: null }
    })
    
    console.log(`\n📊 Found ${profilesWithResumes.length} profiles with resumes`)
    
    let cleared = 0
    
    for (const profile of profilesWithResumes) {
      console.log(`\n🔄 Clearing resume for user ${profile.userId}...`)
      console.log(`   Old URL: ${profile.resumeUrl}`)
      
      // Clear resume fields
      profile.resumeUrl = null
      profile.resumeFilename = null
      profile.cloudinaryPublicId = null
      await profile.save()
      
      console.log(`   ✅ Cleared successfully`)
      cleared++
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('📈 Clear Summary:')
    console.log(`   ✅ Successfully cleared: ${cleared}`)
    console.log(`   📊 Total processed: ${profilesWithResumes.length}`)
    
    console.log('\n🎉 Database cleaned!')
    console.log('   All broken resume entries removed')
    console.log('   Students can now upload fresh resumes')
    
    console.log('\n🚀 Next Steps:')
    console.log('   1. Students should re-upload their resumes')
    console.log('   2. New uploads will use the improved configuration')
    console.log('   3. PDFs should work properly now')
    
  } catch (error) {
    console.error('❌ Clear failed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

// Run the clear
clearBrokenResumes().catch(error => {
  console.error('❌ Script failed:', error.message)
  process.exit(1)
})