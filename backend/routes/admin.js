const express = require('express')
const User = require('../models/User')
const Job = require('../models/Job')
const Application = require('../models/Application')
const { auth } = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')

const router = express.Router()

// Get dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true })
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true })
    const totalCompanies = await User.countDocuments({ role: 'company', isActive: true })
    const totalJobs = await Job.countDocuments()
    const totalApplications = await Application.countDocuments()
    const activeJobs = await Job.countDocuments({ status: 'open' }) // Changed from 'active' to 'open'

    console.log('Admin stats debug:', {
      totalUsers,
      totalStudents,
      totalCompanies,
      totalJobs,
      totalApplications,
      activeJobs
    })

    res.json({
      totalUsers,
      totalStudents,
      totalCompanies,
      totalJobs,
      totalApplications,
      activeJobs
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get recent users
router.get('/recent-users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-password')

    res.json(users)
  } catch (error) {
    console.error('Error fetching recent users:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all users with pagination
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password')

    const total = await User.countDocuments()

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user status
router.patch('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Debug endpoint to check user data
router.get('/debug-users', auth, adminAuth, async (req, res) => {
  try {
    const allUsers = await User.find({}, 'name email role isActive createdAt').sort({ createdAt: -1 })
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 }, users: { $push: { name: '$name', email: '$email', isActive: '$isActive' } } } }
    ])
    
    res.json({
      allUsers,
      usersByRole,
      counts: {
        total: allUsers.length,
        active: allUsers.filter(u => u.isActive).length,
        students: allUsers.filter(u => u.role === 'student').length,
        companies: allUsers.filter(u => u.role === 'company').length,
        admins: allUsers.filter(u => u.role === 'admin').length
      }
    })
  } catch (error) {
    console.error('Error in debug users:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user details
router.get('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router