const express = require('express')
const { body, validationResult } = require('express-validator')
const StudentProfile = require('../models/StudentProfile')
const User = require('../models/User')
const { auth, authorize } = require('../middleware/auth')

const router = express.Router()

// Debug endpoint to check user info
router.get('/debug', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        department: req.user.department,
        isActive: req.user.isActive
      },
      hasProfile: !!(await StudentProfile.findOne({ userId: req.user._id }))
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get student's own profile
router.get('/me', [auth, authorize('student')], async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user._id, req.user.email, req.user.role)
    
    const profile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email department')

    if (!profile) {
      console.log('No profile found for user:', req.user._id)
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.json(profile)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update student profile
router.put('/me', [
  auth,
  authorize('student'),
  body('program').optional().trim().isLength({ min: 2 }),
  body('graduationYear').optional().isInt({ min: 2020, max: 2030 }),
  body('cgpa').optional().isFloat({ min: 0, max: 10 }),
  body('skills').optional().isArray(),
  body('projects').optional().isArray()
], async (req, res) => {
  try {
    console.log('Profile update request from user:', req.user._id, req.user.email, req.user.role)
    console.log('Request body:', JSON.stringify(req.body, null, 2))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    let profile = await StudentProfile.findOne({ userId: req.user._id })
    console.log('Existing profile found:', !!profile)
    
    if (!profile) {
      // Create new profile if doesn't exist
      console.log('Creating new profile for user:', req.user._id)
      profile = new StudentProfile({
        userId: req.user._id,
        program: req.body.program || 'Not specified',
        graduationYear: req.body.graduationYear || new Date().getFullYear() + 4
      })
    }

    // Update fields
    const allowedFields = [
      'program', 'graduationYear', 'cgpa', 'skills', 'projects',
      'resumeUrl', 'linkedinUrl', 'githubUrl', 'portfolioUrl', 'isProfileComplete'
    ]

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field]
      }
    })

    console.log('Profile before save:', JSON.stringify(profile.toObject(), null, 2))
    await profile.save()
    console.log('Profile saved successfully')

    const populatedProfile = await StudentProfile.findById(profile._id)
      .populate('userId', 'name email department')

    res.json({
      message: 'Profile updated successfully',
      profile: populatedProfile
    })
  } catch (error) {
    console.error('Update profile error:', error)
    console.error('Error stack:', error.stack)
    
    // Send more detailed error information
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: error.message,
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      })
    }
    
    res.status(500).json({ 
      message: 'Server error',
      details: error.message 
    })
  }
})

// Get all student profiles (admin only)
router.get('/', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const query = {}
    
    // Build search query
    if (req.query.department) {
      const users = await User.find({ department: req.query.department }).select('_id')
      query.userId = { $in: users.map(u => u._id) }
    }

    if (req.query.graduationYear) {
      query.graduationYear = parseInt(req.query.graduationYear)
    }

    if (req.query.skills) {
      const skills = req.query.skills.split(',').map(s => s.trim())
      query.skills = { $in: skills }
    }

    const profiles = await StudentProfile.find(query)
      .populate('userId', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await StudentProfile.countDocuments(query)

    res.json({
      profiles,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get profiles error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single profile by ID (admin only)
router.get('/:id', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id)
      .populate('userId', 'name email department')

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    res.json(profile)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router