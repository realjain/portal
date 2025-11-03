const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { auth, authorize } = require('../middleware/auth')
const StudentProfile = require('../models/StudentProfile')

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

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId_timestamp.pdf
    const uniqueName = `${req.user._id}_${Date.now()}.pdf`
    cb(null, uniqueName)
  }
})

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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Upload resume endpoint
router.post('/resume', [auth, authorize('student'), upload.single('resume')], async (req, res) => {
  try {
    console.log('Resume upload request from user:', req.user._id, req.user.email)
    
    if (!req.file) {
      console.log('No file in upload request')
      return res.status(400).json({ message: 'No file uploaded' })
    }

    console.log('File uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    })

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

    // Delete old resume file if exists
    if (profile.resumeUrl && profile.resumeUrl.includes('/api/upload/resume/')) {
      const oldFilename = profile.resumeUrl.split('/').pop()
      const oldFilePath = path.join(uploadsDir, oldFilename)
      console.log('Checking for old resume:', oldFilePath)
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
        console.log('Deleted old resume file')
      }
    }

    // Update profile with new resume URL
    profile.resumeUrl = `/api/upload/resume/${req.file.filename}`
    profile.resumeFilename = req.file.originalname
    await profile.save()

    console.log('Profile updated with resume URL:', profile.resumeUrl)

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: profile.resumeUrl,
      filename: req.file.originalname,
      fileSize: req.file.size
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({ message: 'Failed to upload resume', error: error.message })
  }
})

// Serve resume files
router.get('/resume/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const { download } = req.query // Check if download is requested
    
    console.log('Resume request:', { filename, download, userAgent: req.get('User-Agent') })
    
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
})

// Delete resume endpoint
router.delete('/resume', [auth, authorize('student')], async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id })
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({ message: 'No resume found' })
    }

    // Delete file if it's stored locally
    if (profile.resumeUrl.includes('/api/upload/resume/')) {
      const filename = profile.resumeUrl.split('/').pop()
      const filePath = path.join(uploadsDir, filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Remove resume from profile
    profile.resumeUrl = null
    profile.resumeFilename = null
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
      filename: profile.resumeFilename || 'resume.pdf'
    })
  } catch (error) {
    console.error('Resume info error:', error)
    res.status(500).json({ message: 'Failed to get resume info' })
  }
})

// Test endpoint to check upload system
router.get('/test', (req, res) => {
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
          url: `/api/upload/resume/${filename}`
        }
      } catch (error) {
        return {
          filename,
          error: error.message
        }
      }
    })
    
    res.json({
      message: 'Upload system test',
      uploadsDir,
      dirExists,
      fileCount: files.length,
      files: fileDetails,
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform
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