const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { auth, authorize } = require('../middleware/auth')
const StudentProfile = require('../models/StudentProfile')
const { cloudinary, testCloudinaryConnection } = require('../config/cloudinary')

const router = express.Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/resumes')
console.log('Uploads directory path:', uploadsDir)

try {
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory:', uploadsDir)
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log('Uploads directory created successfully')
  } else {
    console.log('Uploads directory already exists')
  }
  
  // Test write permissions
  const testFile = path.join(uploadsDir, 'test-write.txt')
  fs.writeFileSync(testFile, 'test')
  fs.unlinkSync(testFile)
  console.log('Uploads directory is writable')
} catch (error) {
  console.error('Error setting up uploads directory:', error)
}

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for Cloudinary
  }
})

// Upload resume endpoint with Cloudinary
router.post('/resume', [auth, authorize('student'), upload.single('resume')], async (req, res) => {
  try {
    console.log('Resume upload request from user:', req.user._id, req.user.email)
    
    if (!req.file) {
      console.log('No file in upload request')
      return res.status(400).json({ message: 'No file uploaded' })
    }

    console.log('File uploaded to memory:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    })

    // Test Cloudinary connection before upload
    const isCloudinaryConnected = await testCloudinaryConnection()
    if (!isCloudinaryConnected) {
      console.error('Cloudinary connection failed')
      return res.status(500).json({ 
        message: 'File upload service unavailable. Please check Cloudinary configuration.' 
      })
    }

    // Get or create student profile
    let profile = await StudentProfile.findOne({ userId: req.user._id })
    if (!profile) {
      console.log('Creating new profile for user:', req.user._id)
      profile = new StudentProfile({
        userId: req.user._id,
        program: 'Not specified',
        graduationYear: new Date().getFullYear() + 1
      })
    }

    // Delete old resume from Cloudinary if exists
    if (profile.cloudinaryPublicId) {
      try {
        console.log('Deleting old resume from Cloudinary:', profile.cloudinaryPublicId)
        await cloudinary.uploader.destroy(profile.cloudinaryPublicId, { resource_type: 'raw' })
        console.log('Old resume deleted from Cloudinary')
      } catch (deleteError) {
        console.error('Error deleting old resume from Cloudinary:', deleteError)
        // Continue with upload even if deletion fails
      }
    }

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...')
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // Use raw for PDF files - this is correct for PDFs
          folder: 'placement-portal/resumes',
          public_id: `resume_${req.user._id}_${Date.now()}`,
          type: 'upload',
          access_mode: 'public', // Ensure public access
          use_filename: false,
          unique_filename: true,
          overwrite: true,
          invalidate: true,
          secure: true, // Force HTTPS
          // Additional settings to ensure public access
          quality_analysis: false,
          accessibility_analysis: false,
          cinemagraph_analysis: false,
          colors: false,
          faces: false,
          image_metadata: false,
          phash: false,
          predominant_colors: false
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Cloudinary upload successful:', {
              public_id: result.public_id,
              secure_url: result.secure_url,
              bytes: result.bytes,
              format: result.format
            })
            resolve(result)
          }
        }
      )
      
      uploadStream.end(req.file.buffer)
    })

    // Generate proper PDF viewing URL for Cloudinary (without attachment flag for inline viewing)
    const viewableUrl = uploadResult.secure_url // Keep original URL for inline viewing
    console.log('Generated viewable URL:', viewableUrl)

    // Update profile with viewable Cloudinary URL
    profile.resumeUrl = viewableUrl
    profile.resumeFilename = req.file.originalname
    profile.cloudinaryPublicId = uploadResult.public_id
    await profile.save()

    console.log('Profile updated with viewable Cloudinary URL:', profile.resumeUrl)

    res.json({
      message: 'Resume uploaded successfully to Cloudinary',
      resumeUrl: profile.resumeUrl,
      filename: req.file.originalname,
      fileSize: req.file.size,
      cloudinaryUrl: uploadResult.secure_url,
      viewableUrl: viewableUrl,
      publicId: uploadResult.public_id,
      uploadedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    res.status(500).json({ 
      message: 'Failed to upload resume', 
      error: error.message,
      details: error.http_code ? `Cloudinary error: ${error.http_code}` : 'Server error'
    })
  }
})

// Serve resume files with proper PDF viewing support
router.get('/resume/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const { view, download } = req.query
    console.log('Resume request for user:', userId, 'view:', view, 'download:', download)
    
    // Find the student profile
    const profile = await StudentProfile.findOne({ userId: userId })
    if (!profile || !profile.resumeUrl) {
      console.log('No resume found for user:', userId)
      return res.status(404).json({ 
        message: 'Resume not found',
        userId: userId,
        suggestion: 'Student needs to upload a resume'
      })
    }

    console.log('Found resume for user:', userId, 'URL:', profile.resumeUrl)

    // If it's a Cloudinary URL, handle properly
    if (profile.resumeUrl.includes('cloudinary.com')) {
      console.log('Serving Cloudinary URL for user:', userId)
      
      let finalUrl = profile.resumeUrl
      
      // Modify URL based on request type
      if (download === 'true') {
        // Force download by adding attachment flag
        if (!finalUrl.includes('/upload/fl_attachment/')) {
          finalUrl = finalUrl.replace('/upload/', '/upload/fl_attachment/')
        }
      } else {
        // For inline viewing, ensure no attachment flag
        finalUrl = finalUrl.replace('/upload/fl_attachment/', '/upload/')
      }
      
      console.log('Redirecting to Cloudinary URL:', finalUrl)
      return res.redirect(finalUrl)
    }

    // Fallback to local file serving for old uploads
    console.log('Attempting to serve local file for user:', userId)
    const filename = profile.resumeUrl.split('/').pop()
    
    // Check if local file exists before trying to serve
    const filePath = path.join(uploadsDir, filename)
    if (!fs.existsSync(filePath)) {
      console.log('Local file not found:', filePath)
      return res.status(404).json({ 
        message: 'Resume file not found on server',
        userId: userId,
        filename: filename,
        suggestion: 'Please re-upload your resume to migrate to Cloudinary storage',
        storageType: 'local (deprecated)'
      })
    }
    
    return serveLocalFile(filename, req, res)
  } catch (error) {
    console.error('Resume serve error for user:', req.params.userId, error)
    res.status(500).json({ 
      message: 'Failed to serve resume',
      userId: req.params.userId,
      error: error.message,
      suggestion: 'Please try again or re-upload your resume'
    })
  }
})



// PDF viewer endpoint for current user - serves PDF directly for browser viewing
router.get('/pdf/me', [auth], async (req, res) => {
  try {
    const userId = req.user._id
    console.log('PDF viewer request for current user:', userId)
    
    // Find the student profile
    const profile = await StudentProfile.findOne({ userId: userId })
    if (!profile || !profile.resumeUrl) {
      console.log('No PDF found for current user:', userId)
      return res.status(404).json({ message: 'PDF not found' })
    }

    console.log('Found PDF for current user:', userId, 'URL:', profile.resumeUrl)

    // For Cloudinary URLs, proxy the PDF with proper headers
    if (profile.resumeUrl.includes('cloudinary.com')) {
      try {
        console.log('Proxying PDF from Cloudinary:', profile.resumeUrl)
        
        // Fetch the PDF from Cloudinary
        const https = require('https')
        const http = require('http')
        
        const protocol = profile.resumeUrl.startsWith('https:') ? https : http
        
        const request = protocol.get(profile.resumeUrl, (cloudinaryRes) => {
          // Set proper headers for inline PDF viewing
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', `inline; filename="${profile.resumeFilename || 'resume.pdf'}"`)
          res.setHeader('Cache-Control', 'public, max-age=3600')
          res.setHeader('Content-Length', cloudinaryRes.headers['content-length'])
          res.setHeader('Accept-Ranges', 'bytes')
          
          // Pipe the PDF content directly to the response
          cloudinaryRes.pipe(res)
        })
        
        request.on('error', (error) => {
          console.error('Error fetching PDF from Cloudinary:', error)
          res.status(500).json({ message: 'Error loading PDF from storage' })
        })
        
        return
        
      } catch (error) {
        console.error('Error proxying PDF:', error)
        // Fallback to redirect
        return res.redirect(profile.resumeUrl)
      }
    }

    // Fallback for local files
    const filename = profile.resumeUrl.split('/').pop()
    return serveLocalFile(filename, req, res)
    
  } catch (error) {
    console.error('PDF viewer error for current user:', error)
    res.status(500).json({ message: 'Error loading PDF', error: error.message })
  }
})

// Public PDF viewer endpoint for current user (uses session/cookie if available)
router.get('/pdf/current', async (req, res) => {
  try {
    console.log('Current user PDF request')
    
    // Try to get user from token if available, otherwise return error
    let userId = null
    
    // Check if authorization header exists
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token ||
                  req.query.token
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.user.id
      } catch (err) {
        console.log('Token verification failed:', err.message)
      }
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' })
    }
    
    console.log('Current user PDF request for user:', userId)
    
    // Find the student profile
    const profile = await StudentProfile.findOne({ userId: userId })
    if (!profile || !profile.resumeUrl) {
      console.log('No PDF found for current user:', userId)
      return res.status(404).json({ message: 'PDF not found' })
    }

    console.log('Found PDF for current user:', userId, 'URL:', profile.resumeUrl)

    // For Cloudinary URLs, proxy the PDF with proper headers
    if (profile.resumeUrl.includes('cloudinary.com')) {
      try {
        console.log('Proxying PDF from Cloudinary:', profile.resumeUrl)
        
        // Fetch the PDF from Cloudinary
        const https = require('https')
        const http = require('http')
        
        const protocol = profile.resumeUrl.startsWith('https:') ? https : http
        
        const request = protocol.get(profile.resumeUrl, (cloudinaryRes) => {
          // Set proper headers for inline PDF viewing
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', `inline; filename="${profile.resumeFilename || 'resume.pdf'}"`)
          res.setHeader('Cache-Control', 'public, max-age=3600')
          res.setHeader('Content-Length', cloudinaryRes.headers['content-length'])
          res.setHeader('Accept-Ranges', 'bytes')
          
          // Pipe the PDF content directly to the response
          cloudinaryRes.pipe(res)
        })
        
        request.on('error', (error) => {
          console.error('Error fetching PDF from Cloudinary:', error)
          res.status(500).json({ message: 'Error loading PDF from storage' })
        })
        
        return
        
      } catch (error) {
        console.error('Error proxying PDF:', error)
        // Fallback to redirect
        return res.redirect(profile.resumeUrl)
      }
    }

    // Fallback for local files
    const filename = profile.resumeUrl.split('/').pop()
    return serveLocalFile(filename, req, res)
    
  } catch (error) {
    console.error('Current user PDF viewer error:', error)
    res.status(500).json({ message: 'Error loading PDF', error: error.message })
  }
})

// Public PDF viewer endpoint - serves PDF directly for browser viewing (no auth required)
router.get('/pdf/public/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    console.log('Public PDF viewer request for user:', userId)
    
    // Check for invalid userId values
    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.log('Invalid userId received:', userId)
      return res.status(400).json({ message: 'Invalid user ID provided' })
    }
    
    // Find the student profile
    let profile = await StudentProfile.findOne({ userId: userId })
    
    // If not found, try finding by _id
    if (!profile) {
      try {
        const mongoose = require('mongoose')
        if (mongoose.Types.ObjectId.isValid(userId)) {
          profile = await StudentProfile.findById(userId)
        }
      } catch (err) {
        console.log('Error trying to find by _id:', err.message)
      }
    }
    
    if (!profile) {
      console.log('No profile found for user:', userId)
      return res.status(404).json({ message: 'Student profile not found' })
    }
    
    if (!profile.resumeUrl) {
      console.log('No resume URL found for user:', userId)
      return res.status(404).json({ message: 'No resume uploaded' })
    }

    console.log('Found PDF for user:', userId, 'URL:', profile.resumeUrl)

    // For Cloudinary URLs, proxy the PDF with proper headers
    if (profile.resumeUrl.includes('cloudinary.com')) {
      try {
        console.log('Proxying PDF from Cloudinary:', profile.resumeUrl)
        
        // Fetch the PDF from Cloudinary
        const https = require('https')
        const http = require('http')
        
        const protocol = profile.resumeUrl.startsWith('https:') ? https : http
        
        const request = protocol.get(profile.resumeUrl, (cloudinaryRes) => {
          // Set proper headers for inline PDF viewing
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', `inline; filename="${profile.resumeFilename || 'resume.pdf'}"`)
          res.setHeader('Cache-Control', 'public, max-age=3600')
          res.setHeader('Content-Length', cloudinaryRes.headers['content-length'])
          res.setHeader('Accept-Ranges', 'bytes')
          
          // Pipe the PDF content directly to the response
          cloudinaryRes.pipe(res)
        })
        
        request.on('error', (error) => {
          console.error('Error fetching PDF from Cloudinary:', error)
          res.status(500).json({ message: 'Error loading PDF from storage' })
        })
        
        return
        
      } catch (error) {
        console.error('Error proxying PDF:', error)
        // Fallback to redirect
        return res.redirect(profile.resumeUrl)
      }
    }

    // Fallback for local files
    const filename = profile.resumeUrl.split('/').pop()
    return serveLocalFile(filename, req, res)
    
  } catch (error) {
    console.error('Public PDF viewer error for user:', req.params.userId, error)
    res.status(500).json({ message: 'Error loading PDF', error: error.message })
  }
})

// PDF viewer endpoint - serves PDF directly for browser viewing
router.get('/pdf/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    console.log('PDF viewer request for user:', userId)
    
    // Check for invalid userId values
    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.log('Invalid userId received:', userId)
      return res.status(400).json({ message: 'Invalid user ID provided' })
    }
    
    // Log userId for debugging
    console.log('Received userId:', userId, 'Type:', typeof userId, 'Length:', userId.length)
    
    // Find the student profile - try both as string and ObjectId
    let profile = await StudentProfile.findOne({ userId: userId })
    
    // If not found, try finding by _id in case userId is actually the document _id
    if (!profile) {
      console.log('Profile not found by userId, trying by _id...')
      try {
        const mongoose = require('mongoose')
        if (mongoose.Types.ObjectId.isValid(userId)) {
          profile = await StudentProfile.findById(userId)
        }
      } catch (err) {
        console.log('Error trying to find by _id:', err.message)
      }
    }
    if (!profile) {
      console.log('No profile found for user:', userId)
      return res.status(404).json({ message: 'Student profile not found' })
    }
    
    if (!profile.resumeUrl) {
      console.log('No resume URL found for user:', userId)
      return res.status(404).json({ message: 'No resume uploaded' })
    }

    console.log('Found PDF for user:', userId, 'URL:', profile.resumeUrl)

    // For Cloudinary URLs, proxy the PDF with proper headers
    if (profile.resumeUrl.includes('cloudinary.com')) {
      try {
        console.log('Proxying PDF from Cloudinary:', profile.resumeUrl)
        
        // Fetch the PDF from Cloudinary
        const https = require('https')
        const http = require('http')
        
        const protocol = profile.resumeUrl.startsWith('https:') ? https : http
        
        const request = protocol.get(profile.resumeUrl, (cloudinaryRes) => {
          // Set proper headers for inline PDF viewing
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', `inline; filename="${profile.resumeFilename || 'resume.pdf'}"`)
          res.setHeader('Cache-Control', 'public, max-age=3600')
          res.setHeader('Content-Length', cloudinaryRes.headers['content-length'])
          res.setHeader('Accept-Ranges', 'bytes')
          
          // Pipe the PDF content directly to the response
          cloudinaryRes.pipe(res)
        })
        
        request.on('error', (error) => {
          console.error('Error fetching PDF from Cloudinary:', error)
          res.status(500).json({ message: 'Error loading PDF from storage' })
        })
        
        return
        
      } catch (error) {
        console.error('Error proxying PDF:', error)
        // Fallback to redirect
        return res.redirect(profile.resumeUrl)
      }
    }

    // Fallback for local files
    const filename = profile.resumeUrl.split('/').pop()
    return serveLocalFile(filename, req, res)
    
  } catch (error) {
    console.error('PDF viewer error for user:', req.params.userId, error)
    res.status(500).json({ message: 'Error loading PDF', error: error.message })
  }
})

// Serve local resume files (fallback for old uploads)
router.get('/resume/file/:filename', (req, res) => {
  const filename = req.params.filename
  return serveLocalFile(filename, req, res)
})

// Helper function to serve local files
function serveLocalFile(filename, req, res) {
  try {
    const { download } = req.query // Check if download is requested
    
    console.log('Local resume request:', { filename, download, userAgent: req.get('User-Agent') })
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.log('Invalid filename:', filename)
      return res.status(400).json({ message: 'Invalid filename' })
    }
    
    const filePath = path.join(uploadsDir, filename)
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.error('Uploads directory does not exist:', uploadsDir)
      return res.status(500).json({ 
        message: 'Upload directory not found',
        uploadsDir 
      })
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('Resume file not found:', filePath)
      
      // List available files for debugging
      try {
        const availableFiles = fs.readdirSync(uploadsDir)
        console.log('Available files in uploads directory:', availableFiles)
        return res.status(404).json({ 
          message: 'Resume not found', 
          filename, 
          path: filePath,
          availableFiles: availableFiles.slice(0, 5) // Show first 5 files
        })
      } catch (dirError) {
        console.error('Error reading uploads directory:', dirError)
        return res.status(404).json({ 
          message: 'Resume not found and cannot list directory', 
          filename, 
          path: filePath 
        })
      }
    }

    // Get file stats
    let stats
    try {
      stats = fs.statSync(filePath)
      console.log('Resume file stats:', { 
        size: stats.size, 
        modified: stats.mtime,
        isFile: stats.isFile()
      })
      
      if (!stats.isFile()) {
        console.error('Path is not a file:', filePath)
        return res.status(400).json({ message: 'Invalid file' })
      }
    } catch (statError) {
      console.error('Error getting file stats:', statError)
      return res.status(500).json({ message: 'Error accessing file' })
    }

    // Set CORS headers explicitly for file serving
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', stats.size)
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    
    // Set disposition based on request
    if (download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      console.log('Serving as download:', filename)
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
      console.log('Serving for inline viewing:', filename)
    }
    
    // Handle range requests for better PDF viewing
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1
      const chunksize = (end - start) + 1
      
      res.status(206)
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`)
      res.setHeader('Content-Length', chunksize)
      
      const fileStream = fs.createReadStream(filePath, { start, end })
      fileStream.pipe(res)
    } else {
      // Serve entire file
      const fileStream = fs.createReadStream(filePath)
      
      fileStream.on('error', (streamError) => {
        console.error('File stream error:', streamError)
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error reading file', error: streamError.message })
        }
      })
      
      fileStream.on('open', () => {
        console.log('File stream opened successfully for:', filename)
      })
      
      fileStream.on('end', () => {
        console.log('File stream ended for:', filename)
      })
      
      fileStream.pipe(res)
    }
    
  } catch (error) {
    console.error('Resume serve error:', error)
    console.error('Error stack:', error.stack)
    
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Failed to serve resume', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}

// Delete resume endpoint
router.delete('/resume', [auth, authorize('student')], async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id })
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({ message: 'No resume found' })
    }

    // Delete from Cloudinary if public ID exists
    if (profile.cloudinaryPublicId) {
      try {
        console.log('Deleting resume from Cloudinary:', profile.cloudinaryPublicId)
        await cloudinary.uploader.destroy(profile.cloudinaryPublicId, { resource_type: 'raw' })
        console.log('Resume deleted from Cloudinary successfully')
      } catch (deleteError) {
        console.error('Error deleting resume from Cloudinary:', deleteError)
        // Continue with database cleanup even if Cloudinary deletion fails
      }
    }

    // Delete file if it's stored locally (fallback for old uploads)
    if (profile.resumeUrl.includes('/api/upload/resume/')) {
      const filename = profile.resumeUrl.split('/').pop()
      const filePath = path.join(uploadsDir, filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log('Local resume file deleted:', filename)
      }
    }

    // Remove resume from profile
    profile.resumeUrl = null
    profile.resumeFilename = null
    profile.cloudinaryPublicId = null
    await profile.save()

    res.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Resume delete error:', error)
    res.status(500).json({ message: 'Failed to delete resume' })
  }
})

// Get resume info
router.get('/resume-info', [auth, authorize('student')], async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id })
    
    if (!profile || !profile.resumeUrl) {
      return res.json({ hasResume: false })
    }

    res.json({
      hasResume: true,
      resumeUrl: profile.resumeUrl,
      filename: profile.resumeFilename || 'resume.pdf',
      userId: req.user._id // Add userId for frontend to use in PDF endpoints
    })
  } catch (error) {
    console.error('Resume info error:', error)
    res.status(500).json({ message: 'Failed to get resume info' })
  }
})

// Cloudinary status check endpoint
router.get('/cloudinary-status', async (req, res) => {
  try {
    const isConnected = await testCloudinaryConnection()
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing',
      api_key: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing'
    }

    res.json({
      message: 'Cloudinary status check',
      connected: isConnected,
      configuration: config,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      message: 'Cloudinary status error',
      error: error.message,
      connected: false
    })
  }
})

// Test PDF URL generation endpoint
router.get('/test-pdf-url/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const profile = await StudentProfile.findOne({ userId: userId })
    
    if (!profile || !profile.resumeUrl) {
      return res.json({
        message: 'No resume found for user',
        userId: userId
      })
    }

    const originalUrl = profile.resumeUrl
    const viewUrl = originalUrl.replace('/upload/fl_attachment/', '/upload/')
    const downloadUrl = originalUrl.includes('/upload/fl_attachment/') 
      ? originalUrl 
      : originalUrl.replace('/upload/', '/upload/fl_attachment/')

    res.json({
      message: 'PDF URL test',
      userId: userId,
      filename: profile.resumeFilename,
      urls: {
        original: originalUrl,
        view: viewUrl,
        download: downloadUrl,
        viewer: `/api/upload/pdf/${userId}`
      },
      isCloudinary: originalUrl.includes('cloudinary.com'),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      message: 'PDF URL test error',
      error: error.message
    })
  }
})

// Test endpoint to check upload system
router.get('/test', async (req, res) => {
  try {
    const dirExists = fs.existsSync(uploadsDir)
    const files = dirExists ? fs.readdirSync(uploadsDir) : []
    
    // Get file details
    const fileDetails = files.slice(0, 10).map(filename => {
      try {
        const filePath = path.join(uploadsDir, filename)
        const stats = fs.statSync(filePath)
        return {
          filename,
          size: stats.size,
          modified: stats.mtime,
          url: `/api/upload/resume/file/${filename}`
        }
      } catch (error) {
        return {
          filename,
          error: error.message
        }
      }
    })

    // Test Cloudinary connection
    const cloudinaryStatus = await testCloudinaryConnection()
    
    res.json({
      message: 'Upload system test',
      cloudinary: {
        connected: cloudinaryStatus,
        configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
      },
      localStorage: {
        uploadsDir,
        dirExists,
        fileCount: files.length,
        files: fileDetails
      },
      serverInfo: {
        serverTime: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Upload system error',
      error: error.message,
      uploadsDir,
      stack: error.stack
    })
  }
})

module.exports = router