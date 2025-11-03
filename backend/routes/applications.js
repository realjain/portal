const express = require('express')
const { body, validationResult, query } = require('express-validator')
const Application = require('../models/Application')
const Job = require('../models/Job')
const StudentProfile = require('../models/StudentProfile')
const User = require('../models/User')
const { auth, authorize } = require('../middleware/auth')

const router = express.Router()

// Create application (student only - must be verified by faculty)
router.post('/', [
  auth,
  authorize('student'),
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('coverLetter').trim().isLength({ min: 50 }).withMessage('Cover letter must be at least 50 characters')
], async (req, res) => {
  try {
    console.log('Application submission request from user:', req.user._id, req.user.email, req.user.role)
    console.log('Request body:', JSON.stringify(req.body, null, 2))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    // Check if student is verified by faculty
    if (!req.user.isVerified || req.user.verificationStatus !== 'approved') {
      return res.status(403).json({ 
        message: 'You must be verified by faculty before applying for jobs',
        verificationStatus: req.user.verificationStatus,
        requiresVerification: true
      })
    }

    const { jobId, coverLetter, resumeUrl, screeningAnswers } = req.body

    // Check if job exists and is open
    const job = await Job.findById(jobId)
    if (!job) {
      console.log('Job not found:', jobId)
      return res.status(404).json({ message: 'Job not found' })
    }

    console.log('Job found:', job.title, 'Status:', job.status, 'Deadline:', job.deadline)

    if (job.status !== 'open') {
      console.log('Job not open for applications')
      return res.status(400).json({ message: 'Job is not accepting applications' })
    }

    if (new Date(job.deadline) <= new Date()) {
      console.log('Application deadline has passed')
      return res.status(400).json({ message: 'Application deadline has passed' })
    }

    // Check if student already applied
    const existingApplication = await Application.findOne({
      jobId,
      studentId: req.user._id
    })

    if (existingApplication) {
      console.log('Student already applied for this job')
      return res.status(400).json({ message: 'You have already applied for this job' })
    }

    // Check eligibility and profile
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id })
    console.log('Student profile found:', !!studentProfile)
    console.log('Profile complete:', studentProfile?.isProfileComplete)

    if (!studentProfile) {
      console.log('No student profile found')
      return res.status(400).json({ message: 'Please create your profile before applying' })
    }

    if (!studentProfile.isProfileComplete) {
      console.log('Profile not complete')
      return res.status(400).json({ message: 'Please complete your profile before applying' })
    }

    if (job.eligibility) {
      console.log('Checking eligibility requirements:', job.eligibility)
      
      if (job.eligibility.minCgpa && studentProfile?.cgpa < job.eligibility.minCgpa) {
        console.log('CGPA requirement not met:', studentProfile.cgpa, '<', job.eligibility.minCgpa)
        return res.status(400).json({ message: 'CGPA requirement not met' })
      }

      if (job.eligibility.graduationYear?.length > 0 && 
          !job.eligibility.graduationYear.includes(studentProfile?.graduationYear)) {
        console.log('Graduation year requirement not met:', studentProfile.graduationYear, 'not in', job.eligibility.graduationYear)
        return res.status(400).json({ message: 'Graduation year requirement not met' })
      }
    }

    // Create application
    console.log('Creating application...')
    const application = new Application({
      jobId,
      studentId: req.user._id,
      coverLetter,
      resumeUrl,
      screeningAnswers: screeningAnswers || [],
      stageHistory: [{
        stage: 'applied',
        changedBy: req.user._id,
        changedAt: new Date()
      }]
    })

    console.log('Application object created, saving...')
    await application.save()
    console.log('Application saved successfully')

    const populatedApplication = await Application.findById(application._id)
      .populate('jobId', 'title company')
      .populate('studentId', 'name email')

    res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApplication
    })
  } catch (error) {
    console.error('Create application error:', error)
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

// Get student's applications
router.get('/me', [
  auth,
  authorize('student'),
  query('page').optional().isInt({ min: 1 }),
  query('status').optional()
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const query = { studentId: req.user._id }
    if (req.query.status) {
      query.stage = req.query.status
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title company location jobType deadline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Application.countDocuments(query)

    res.json({
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get applications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get applications for a job (company only)
router.get('/job/:jobId', [
  auth,
  authorize('company'),
  query('page').optional().isInt({ min: 1 }),
  query('stage').optional()
], async (req, res) => {
  try {
    const { jobId } = req.params

    // Verify job belongs to company
    const job = await Job.findOne({ _id: jobId, companyId: req.user._id })
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' })
    }

    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const query = { jobId }
    if (req.query.stage) {
      query.stage = req.query.stage
    }

    const applications = await Application.find(query)
      .populate('studentId', 'name email department')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email department'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Application.countDocuments(query)

    // Get stage counts
    const stageCounts = await Application.aggregate([
      { $match: { jobId: job._id } },
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ])

    const stageStats = stageCounts.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    res.json({
      applications,
      stageStats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get job applications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update application stage (company only)
router.patch('/:id/stage', [
  auth,
  authorize('company'),
  body('stage').isIn(['applied', 'shortlisted', 'interview', 'offered', 'rejected']).withMessage('Invalid stage'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { stage, reason } = req.body
    const application = await Application.findById(req.params.id)
      .populate('jobId')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Verify job belongs to company
    if (application.jobId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Update stage
    application.stage = stage
    application.stageHistory.push({
      stage,
      changedBy: req.user._id,
      changedAt: new Date(),
      reason
    })

    await application.save()

    res.json({
      message: 'Application stage updated successfully',
      application
    })
  } catch (error) {
    console.error('Update application stage error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add review/scores (company only)
router.post('/:id/review', [
  auth,
  authorize('company'),
  body('note').optional().trim(),
  body('scores.aptitude').optional().isInt({ min: 0, max: 100 }),
  body('scores.technical').optional().isInt({ min: 0, max: 100 }),
  body('scores.communication').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const { note, scores } = req.body
    const application = await Application.findById(req.params.id)
      .populate('jobId')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Verify job belongs to company
    if (application.jobId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Add review note
    if (note) {
      application.reviewerNotes.push({
        note,
        reviewer: req.user._id,
        createdAt: new Date()
      })
    }

    // Update scores
    if (scores) {
      application.scores = { ...application.scores, ...scores }
    }

    await application.save()

    res.json({
      message: 'Review added successfully',
      application
    })
  } catch (error) {
    console.error('Add review error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin: Get dashboard statistics
router.get('/admin/dashboard', [auth, authorize('admin')], async (req, res) => {
  try {
    // Get total companies (users with role 'company')
    const totalCompanies = await User.countDocuments({ role: 'company', isActive: true })
    
    // Get active companies (companies with at least one open job)
    const activeCompanies = await Job.distinct('companyId', { status: 'open' })
    
    // Get total students
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true })
    
    // Get students with applications
    const studentsWithApplications = await Application.distinct('studentId')
    
    // Get total applications
    const totalApplications = await Application.countDocuments()
    
    // Get applications by stage
    const applicationsByStage = await Application.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ])
    
    const stageStats = applicationsByStage.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})
    
    // Get recent applications with full details
    const recentApplications = await Application.find()
      .populate('studentId', 'name email department')
      .populate({
        path: 'jobId',
        select: 'title company',
        populate: {
          path: 'companyId',
          model: 'User',
          select: 'name companyName'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10)
    
    // Get student-company application mapping
    const studentCompanyMapping = await Application.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'users',
          localField: 'job.companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: {
            studentId: '$student._id',
            studentName: '$student.name',
            studentEmail: '$student.email',
            studentDepartment: '$student.department'
          },
          companies: {
            $push: {
              companyId: '$company._id',
              companyName: '$company.companyName',
              jobTitle: '$job.title',
              stage: '$stage',
              appliedDate: '$createdAt'
            }
          },
          totalApplications: { $sum: 1 }
        }
      },
      { $sort: { totalApplications: -1 } },
      { $limit: 20 }
    ])
    
    res.json({
      overview: {
        totalCompanies,
        activeCompanies: activeCompanies.length,
        totalStudents,
        studentsWithApplications: studentsWithApplications.length,
        totalApplications,
        stageStats
      },
      recentApplications,
      studentCompanyMapping
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin: Get all applications with advanced filtering
router.get('/admin/all', [
  auth,
  authorize('admin'),
  query('page').optional().isInt({ min: 1 }),
  query('stage').optional(),
  query('company').optional(),
  query('student').optional(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    // Build query
    const query = {}
    
    if (req.query.stage) {
      query.stage = req.query.stage
    }

    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {}
      if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom)
      if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo)
    }

    // Get applications with full population
    const applications = await Application.find(query)
      .populate({
        path: 'studentId',
        select: 'name email department',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email department'
        }
      })
      .populate({
        path: 'jobId',
        select: 'title company location jobType salary deadline',
        populate: {
          path: 'companyId',
          model: 'User',
          select: 'name companyName'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Application.countDocuments(query)

    // Get statistics
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 }
        }
      }
    ])

    const stageStats = stats.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    // Get company-wise application counts
    const companyStats = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'users',
          localField: 'job.companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: {
            companyId: '$company._id',
            companyName: '$company.companyName'
          },
          totalApplications: { $sum: 1 },
          stages: {
            $push: '$stage'
          }
        }
      },
      {
        $project: {
          companyId: '$_id.companyId',
          companyName: '$_id.companyName',
          totalApplications: 1,
          applied: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'applied'] }
              }
            }
          },
          shortlisted: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'shortlisted'] }
              }
            }
          },
          interview: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'interview'] }
              }
            }
          },
          offered: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'offered'] }
              }
            }
          },
          rejected: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'rejected'] }
              }
            }
          }
        }
      },
      { $sort: { totalApplications: -1 } }
    ])

    res.json({
      applications,
      stats: {
        stages: stageStats,
        companies: companyStats,
        total
      },
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Admin get all applications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin: Get application analytics
router.get('/admin/analytics', [auth, authorize('admin')], async (req, res) => {
  try {
    // Monthly application trends
    const monthlyTrends = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ])

    // Success rate by company
    const companySuccessRates = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'users',
          localField: 'job.companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: '$company.companyName',
          total: { $sum: 1 },
          offered: {
            $sum: { $cond: [{ $eq: ['$stage', 'offered'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$stage', 'rejected'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          companyName: '$_id',
          total: 1,
          offered: 1,
          rejected: 1,
          successRate: {
            $multiply: [
              { $divide: ['$offered', '$total'] },
              100
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ])

    // Top performing students
    const topStudents = await Application.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student._id',
          name: { $first: '$student.name' },
          email: { $first: '$student.email' },
          department: { $first: '$student.department' },
          totalApplications: { $sum: 1 },
          offered: {
            $sum: { $cond: [{ $eq: ['$stage', 'offered'] }, 1, 0] }
          },
          avgAptitudeScore: { $avg: '$scores.aptitude' },
          avgTechnicalScore: { $avg: '$scores.technical' },
          avgCommunicationScore: { $avg: '$scores.communication' }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          department: 1,
          totalApplications: 1,
          offered: 1,
          successRate: {
            $multiply: [
              { $divide: ['$offered', '$totalApplications'] },
              100
            ]
          },
          avgAptitudeScore: { $round: ['$avgAptitudeScore', 1] },
          avgTechnicalScore: { $round: ['$avgTechnicalScore', 1] },
          avgCommunicationScore: { $round: ['$avgCommunicationScore', 1] }
        }
      },
      { $sort: { successRate: -1, totalApplications: -1 } },
      { $limit: 10 }
    ])

    res.json({
      monthlyTrends,
      companySuccessRates,
      topStudents
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Company: Get comprehensive application dashboard
router.get('/company/dashboard', [auth, authorize('company')], async (req, res) => {
  try {
    // Get all jobs by this company
    const jobs = await Job.find({ companyId: req.user._id }).select('_id title')
    const jobIds = jobs.map(job => job._id)

    // Get application statistics
    const stats = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 }
        }
      }
    ])

    const stageStats = stats.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    // Get recent applications
    const recentApplications = await Application.find({ jobId: { $in: jobIds } })
      .populate('studentId', 'name email department')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(10)

    // Get job-wise application counts
    const jobStats = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: '$jobId',
          totalApplications: { $sum: 1 },
          stages: { $push: '$stage' }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          jobTitle: '$job.title',
          totalApplications: 1,
          applied: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'applied'] }
              }
            }
          },
          shortlisted: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'shortlisted'] }
              }
            }
          },
          interview: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'interview'] }
              }
            }
          },
          offered: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'offered'] }
              }
            }
          },
          rejected: {
            $size: {
              $filter: {
                input: '$stages',
                cond: { $eq: ['$$this', 'rejected'] }
              }
            }
          }
        }
      },
      { $sort: { totalApplications: -1 } }
    ])

    // Get top candidates (highest scores)
    const topCandidates = await Application.find({ 
      jobId: { $in: jobIds },
      $or: [
        { 'scores.aptitude': { $exists: true } },
        { 'scores.technical': { $exists: true } },
        { 'scores.communication': { $exists: true } }
      ]
    })
      .populate('studentId', 'name email department')
      .populate('jobId', 'title')
      .sort({ 
        'scores.aptitude': -1, 
        'scores.technical': -1, 
        'scores.communication': -1 
      })
      .limit(10)

    res.json({
      overview: {
        totalApplications: Object.values(stageStats).reduce((a, b) => a + b, 0),
        stageStats
      },
      recentApplications,
      jobStats,
      topCandidates
    })
  } catch (error) {
    console.error('Company dashboard error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Company: Get detailed student profile for application
router.get('/:id/student-profile', [auth, authorize('company')], async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'jobId',
        select: 'companyId'
      })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Verify job belongs to company
    if (application.jobId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Get detailed student profile
    const studentProfile = await StudentProfile.findOne({ userId: application.studentId })
      .populate('userId', 'name email department')

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' })
    }

    // Get student's other applications (for context)
    const otherApplications = await Application.find({ 
      studentId: application.studentId,
      _id: { $ne: application._id }
    })
      .populate('jobId', 'title company')
      .select('stage createdAt')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      application,
      profile: studentProfile,
      otherApplications
    })
  } catch (error) {
    console.error('Get student profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Company: Bulk update application stages
router.patch('/bulk-update', [
  auth,
  authorize('company'),
  body('applicationIds').isArray().withMessage('Application IDs must be an array'),
  body('stage').isIn(['applied', 'shortlisted', 'interview', 'offered', 'rejected']).withMessage('Invalid stage'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { applicationIds, stage, reason } = req.body

    // Verify all applications belong to company's jobs
    const applications = await Application.find({ _id: { $in: applicationIds } })
      .populate('jobId', 'companyId')

    const unauthorizedApps = applications.filter(app => 
      app.jobId.companyId.toString() !== req.user._id.toString()
    )

    if (unauthorizedApps.length > 0) {
      return res.status(403).json({ message: 'Some applications are unauthorized' })
    }

    // Update all applications
    const updatePromises = applications.map(async (app) => {
      app.stage = stage
      app.stageHistory.push({
        stage,
        changedBy: req.user._id,
        changedAt: new Date(),
        reason
      })
      return app.save()
    })

    await Promise.all(updatePromises)

    res.json({
      message: `${applications.length} applications updated successfully`,
      updatedCount: applications.length
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router