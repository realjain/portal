#!/usr/bin/env node

/**
 * Test Cloudinary 401 Error
 * This script tests different upload configurations to fix 401 errors
 */

require('dotenv').config()
const { cloudinary } = require('./backend/config/cloudinary')
const fs = require('fs')
const path = require('path')

async function testCloudinary401() {
  try {
    console.log('🔍 Testing Cloudinary 401 Error Fix')
    console.log('=' .repeat(50))
    
    // Test Cloudinary connection
    console.log('1. Testing Cloudinary connection...')
    const pingResult = await cloudinary.api.ping()
    console.log('✅ Cloudinary ping successful:', pingResult)
    
    // Check account details
    console.log('\n2. Checking account details...')
    try {
      const usage = await cloudinary.api.usage()
      console.log('✅ Account usage:', {
        credits: usage.credits,
        used_percent: usage.used_percent,
        limit: usage.limit
      })
    } catch (usageError) {
      console.log('⚠️ Could not get usage info:', usageError.message)
    }
    
    // Test different upload configurations
    console.log('\n3. Testing upload configurations...')
    
    // Create a simple test PDF content
    const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF')
    
    const testConfigs = [
      {
        name: 'Auto Resource Type',
        config: {
          resource_type: 'auto',
          folder: 'test-uploads',
          public_id: `test_auto_${Date.now()}`,
          access_mode: 'public',
          secure: true
        }
      },
      {
        name: 'Raw Resource Type',
        config: {
          resource_type: 'raw',
          folder: 'test-uploads',
          public_id: `test_raw_${Date.now()}`,
          access_mode: 'public',
          secure: true
        }
      },
      {
        name: 'Image Resource Type',
        config: {
          resource_type: 'image',
          folder: 'test-uploads',
          public_id: `test_image_${Date.now()}`,
          format: 'pdf',
          access_mode: 'public',
          secure: true
        }
      }
    ]
    
    const results = []
    
    for (const test of testConfigs) {
      try {
        console.log(`\n   Testing: ${test.name}`)
        
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            test.config,
            (error, result) => {
              if (error) {
                reject(error)
              } else {
                resolve(result)
              }
            }
          )
          uploadStream.end(testPdfContent)
        })
        
        console.log(`   ✅ Upload successful: ${uploadResult.secure_url}`)
        
        // Test URL access
        const testUrl = uploadResult.secure_url
        console.log(`   🌐 Testing URL access...`)
        
        try {
          const https = require('https')
          const urlTest = await new Promise((resolve, reject) => {
            https.get(testUrl, (response) => {
              resolve({
                status: response.statusCode,
                headers: response.headers
              })
            }).on('error', reject)
          })
          
          console.log(`   📊 URL Status: ${urlTest.status}`)
          console.log(`   📄 Content-Type: ${urlTest.headers['content-type']}`)
          
          results.push({
            name: test.name,
            success: true,
            url: testUrl,
            status: urlTest.status,
            contentType: urlTest.headers['content-type']
          })
          
          // Clean up test file
          await cloudinary.uploader.destroy(uploadResult.public_id, {
            resource_type: test.config.resource_type === 'auto' ? 'raw' : test.config.resource_type
          })
          console.log(`   🗑️ Test file cleaned up`)
          
        } catch (urlError) {
          console.log(`   ❌ URL test failed: ${urlError.message}`)
          results.push({
            name: test.name,
            success: false,
            error: urlError.message
          })
        }
        
      } catch (uploadError) {
        console.log(`   ❌ Upload failed: ${uploadError.message}`)
        results.push({
          name: test.name,
          success: false,
          error: uploadError.message
        })
      }
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('📈 Test Results Summary:')
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}:`)
      if (result.success) {
        console.log(`   ✅ Status: ${result.status}`)
        console.log(`   📄 Content-Type: ${result.contentType}`)
        console.log(`   🌐 URL Access: Working`)
      } else {
        console.log(`   ❌ Error: ${result.error}`)
      }
    })
    
    // Recommendations
    console.log('\n🎯 Recommendations:')
    const workingConfigs = results.filter(r => r.success && r.status === 200)
    
    if (workingConfigs.length > 0) {
      console.log('✅ Working configurations found:')
      workingConfigs.forEach(config => {
        console.log(`   - ${config.name} (Status: ${config.status})`)
      })
      
      const bestConfig = workingConfigs.find(c => c.contentType === 'application/pdf') || workingConfigs[0]
      console.log(`\n🏆 Recommended: ${bestConfig.name}`)
      console.log('   Update your upload configuration to use this resource type')
    } else {
      console.log('❌ No working configurations found')
      console.log('   This indicates a Cloudinary account or permission issue')
      console.log('   Check your Cloudinary dashboard settings')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('Must supply cloud_name')) {
      console.log('\n🔧 Fix: Check your .env file for correct Cloudinary credentials')
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('\n🔧 Fix: Check your Cloudinary API key and secret')
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      console.log('\n🔧 Fix: Check your Cloudinary account permissions and plan limits')
    }
  }
}

// Run the test
testCloudinaryPdfAccess().catch(error => {
  console.error('❌ Script failed:', error.message)
  process.exit(1)
})