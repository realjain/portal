const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const StudentProfile = require('../models/StudentProfile')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  })
}

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'company', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      })
    }

    const { name, email, password, role, department, companyName } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      department: role === 'student' ? department : undefined,
      companyName: role === 'company' ? companyName : undefined
    })

    await user.save()

    // Create student profile if role is student
    if (role === 'student') {
      const studentProfile = new StudentProfile({
        userId: user._id,
        program: 'Not specified',
        graduationYear: new Date().getFullYear() + 4
      })
      await studentProfile.save()
    }

    const token = generateToken(user._id)

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user.toJSON())
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

// Debug endpoint to check user and password
router.post('/debug-user', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.json({ exists: false, message: 'User not found' })
    }

    const isMatch = await user.comparePassword(password)
    
    res.json({
      exists: true,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      passwordMatch: isMatch,
      hashedPassword: user.password.substring(0, 20) + '...' // Show first 20 chars of hash
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Check all users in database
router.get('/check-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role isActive createdAt').sort({ createdAt: -1 })
    
    const defaultUsers = [
      'admin@portal.com',
      'student@test.com', 
      'company@test.com'
    ]
    
    const existingDefaults = users.filter(user => defaultUsers.includes(user.email))
    const missingDefaults = defaultUsers.filter(email => 
      !users.some(user => user.email === email)
    )
    
    res.json({
      totalUsers: users.length,
      users: users,
      defaultUsers: {
        existing: existingDefaults,
        missing: missingDefaults,
        allExist: missingDefaults.length === 0
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Reset admin password
router.post('/reset-admin', async (req, res) => {
  try {
    const user = await User.findOne({ email: 'admin@portal.com' })
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found' })
    }

    user.password = 'admin123'
    await user.save() // This will trigger the pre-save hook to hash the password

    res.json({ message: 'Admin password reset successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Change password (authenticated users)
router.post('/change-password', [
  auth,
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      })
    }

    const { currentPassword, newPassword } = req.body

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Update password
    req.user.password = newPassword
    await req.user.save() // This will trigger the pre-save hook to hash the password

    res.json({ 
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Server error changing password' })
  }
})

// Reset any user password (for debugging)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and newPassword are required' })
    }
    
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.password = newPassword
    await user.save() // This will trigger the pre-save hook to hash the password

    res.json({ 
      message: 'Password reset successfully',
      user: {
        email: user.email,
        role: user.role,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create default users (for initial setup)
router.post('/create-defaults', async (req, res) => {
  try {
    const createdUsers = []
    const existingUsers = []

    // Check and create Admin User
    let admin = await User.findOne({ email: 'admin@portal.com' })
    if (!admin) {
      admin = new User({
        name: 'System Admin',
        email: 'admin@portal.com',
        password: 'admin123',
        role: 'admin'
      })
      await admin.save()
      createdUsers.push({ email: 'admin@portal.com', password: 'admin123', role: 'admin' })
    } else {
      existingUsers.push({ email: 'admin@portal.com', role: 'admin' })
    }

    // Check and create Sample Student
    let student = await User.findOne({ email: 'student@test.com' })
    if (!student) {
      student = new User({
        name: 'John Doe',
        email: 'student@test.com',
        password: 'student123',
        role: 'student',
        department: 'Computer Science'
      })
      await student.save()
      createdUsers.push({ email: 'student@test.com', password: 'student123', role: 'student' })

      // Create Student Profile
      const existingProfile = await StudentProfile.findOne({ userId: student._id })
      if (!existingProfile) {
        const studentProfile = new StudentProfile({
          userId: student._id,
          program: 'B.Tech Computer Science',
          graduationYear: 2025,
          cgpa: 8.5,
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          projects: [{
            title: 'E-commerce Website',
            description: 'Full-stack e-commerce application with React and Node.js',
            technologies: ['React', 'Node.js', 'MongoDB'],
            url: 'https://github.com/johndoe/ecommerce'
          }],
          resumeUrl: 'https://example.com/resume.pdf',
          isProfileComplete: true
        })
        await studentProfile.save()
      }
    } else {
      existingUsers.push({ email: 'student@test.com', role: 'student' })
    }

    // Check and create Sample Company
    let company = await User.findOne({ email: 'company@test.com' })
    if (!company) {
      company = new User({
        name: 'Tech Corp',
        email: 'company@test.com',
        password: 'company123',
        role: 'company',
        companyName: 'Tech Corp Solutions'
      })
      await company.save()
      createdUsers.push({ email: 'company@test.com', password: 'company123', role: 'company' })
    } else {
      existingUsers.push({ email: 'company@test.com', role: 'company' })
    }

    let message = ''
    if (createdUsers.length > 0 && existingUsers.length > 0) {
      message = `Created ${createdUsers.length} new users. ${existingUsers.length} users already existed.`
    } else if (createdUsers.length > 0) {
      message = 'All default users created successfully!'
    } else {
      message = 'All default users already exist.'
    }

    res.json({
      message,
      created: createdUsers,
      existing: existingUsers,
      users: [
        { email: 'admin@portal.com', password: 'admin123', role: 'admin' },
        { email: 'student@test.com', password: 'student123', role: 'student' },
        { email: 'company@test.com', password: 'company123', role: 'company' }
      ]
    })
  } catch (error) {
    console.error('Error creating default users:', error)
    res.status(500).json({ message: 'Server error creating default users', error: error.message })
  }
})

module.exports = router