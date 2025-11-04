const express = require('express')
const { body, validationResult, query } = require('express-validator')
const Job = require('../models/Job')
const Application = require('../models/Application')
const StudentProfile = require('../models/StudentProfile')
const User = require('../models/User')
const { auth, authorize } = require('../middleware/auth')

const router = express.Router()

// Get all jobs (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().trim(),
  query('skills').optional(),
  query('location').optional().trim(),
  query('jobType').optional().isIn(['internship', 'full-time', 'part-time'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build query
    const query = { status: 'open', deadline: { $gte: new Date() } }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    if (req.query.skills) {
      const skills = req.query.skills.split(',').map(s => s.trim())
      query.skills = { $in: skills }
    }

    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' }
    }

    if (req.query.jobType) {
      query.jobType = req.query.jobType
    }

    const jobs = await Job.find(query)
      .populate('companyId', 'name companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Job.countDocuments(query)

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'name companyName')

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    res.json(job)
  } catch (error) {
    console.error('Get job error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create job (company only)
router.post('/', [
  auth,
  authorize('company'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('company').trim().isLength({ min: 2 }).withMessage('Company name is required'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['internship', 'full-time', 'part-time']).withMessage('Invalid job type'),
  body('deadline').isISO8601().withMessage('Valid deadline is required')
], async (req, res) => {
  try {
    console.log('Job creation request from user:', req.user._id, req.user.email, req.user.role)
    console.log('Request body:', JSON.stringify(req.body, null, 2))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      })
    }

    // Clean up the skills array - remove empty values
    const cleanSkills = req.body.skills.filter(skill => skill && skill.trim() !== '')
    if (cleanSkills.length === 0) {
      return res.status(400).json({ message: 'At least one skill is required' })
    }

    const jobData = {
      ...req.body,
      skills: cleanSkills,
      companyId: req.user._id,
      deadline: new Date(req.body.deadline)
    }

    // Remove undefined/null values
    Object.keys(jobData).forEach(key => {
      if (jobData[key] === undefined || jobData[key] === null || jobData[key] === '') {
        delete jobData[key]
      }
    })

    console.log('Processed job data:', JSON.stringify(jobData, null, 2))

    // Validate deadline is in future
    if (jobData.deadline <= new Date()) {
      return res.status(400).json({ message: 'Deadline must be in the future' })
    }

    const job = new Job(jobData)
    console.log('Job object created, attempting to save...')
    
    await job.save()
    console.log('Job saved successfully with ID:', job._id)

    const populatedJob = await Job.findById(job._id)
      .populate('companyId', 'name companyName')

    res.status(201).json({
      message: 'Job created successfully',
      job: populatedJob
    })
  } catch (error) {
    console.error('Create job error:', error)
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
      message: 'Server error creating job',
      details: error.message 
    })
  }
})

// Debug endpoint for job creation
router.post('/debug', [auth, authorize('company')], async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        companyName: req.user.companyName,
        isActive: req.user.isActive
      },
      requestBody: req.body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get company's jobs  
router.get('/company/me', [
  auth,
  authorize('company'),
  query('page').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['open', 'closed', 'draft'])
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const query = { companyId: req.user._id }
    if (req.query.status) {
      query.status = req.query.status
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Job.countDocuments(query)

    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ jobId: job._id })
        return {
          ...job.toObject(),
          applicationCount
        }
      })
    )

    res.json({
      jobs: jobsWithCounts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get recruiter jobs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update job
router.put('/:id', [
  auth,
  authorize('company'),
  body('title').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('deadline').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id })
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' })
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        job[key] = req.body[key]
      }
    })

    if (req.body.deadline) {
      job.deadline = new Date(req.body.deadline)
      if (job.deadline <= new Date()) {
        return res.status(400).json({ message: 'Deadline must be in the future' })
      }
    }

    await job.save()

    res.json({
      message: 'Job updated successfully',
      job
    })
  } catch (error) {
    console.error('Update job error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete job
router.delete('/:id', [auth, authorize('company')], async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id })
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' })
    }

    // Check if there are applications
    const applicationCount = await Application.countDocuments({ jobId: job._id })
    if (applicationCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete job with existing applications. Close the job instead.' 
      })
    }

    await Job.findByIdAndDelete(req.params.id)

    res.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Delete job error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get skill-matched jobs for verified students
router.get('/matched', [auth, authorize('student')], async (req, res) => {
  try {
    // Check if student is verified
    if (!req.user.isVerified || req.user.verificationStatus !== 'approved') {
      return res.status(403).json({ 
        message: 'You must be verified by faculty to view matched jobs',
        verificationStatus: req.user.verificationStatus,
        requiresVerification: true
      })
    }

    // Get student profile
    const profile = await StudentProfile.findOne({ userId: req.user._id })
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return res.json({
        jobs: [],
        message: 'Complete your profile with skills to see matched jobs',
        totalJobs: 0,
        matchedJobs: 0,
        skillsNeeded: true
      })
    }

    // Get all open jobs
    const allJobs = await Job.find({ 
      status: 'open', 
      deadline: { $gte: new Date() } 
    }).populate('companyId', 'name companyName')

    // Calculate skill matches for each job
    const jobsWithMatches = allJobs.map(job => {
      const jobObj = job.toObject()
      
      if (!job.requiredSkills || job.requiredSkills.length === 0) {
        return {
          ...jobObj,
          matchingSkills: [],
          missingSkills: [],
          matchPercentage: 0,
          isEligible: checkJobEligibility(profile, job.eligibility),
          skillMatch: false
        }
      }

      // Find matching skills
      const matchingSkills = profile.skills.filter(skill => 
        job.requiredSkills.some(reqSkill => 
          reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(reqSkill.toLowerCase())
        )
      )

      // Find missing skills
      const missingSkills = job.requiredSkills.filter(reqSkill =>
        !profile.skills.some(skill =>
          reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(reqSkill.toLowerCase())
        )
      )

      const matchPercentage = Math.round((matchingSkills.length / job.requiredSkills.length) * 100)
      const isEligible = checkJobEligibility(profile, job.eligibility)
      const skillMatch = matchingSkills.length > 0

      return {
        ...jobObj,
        matchingSkills,
        missingSkills,
        matchPercentage,
        isEligible,
        skillMatch,
        recommendationScore: calculateRecommendationScore(matchPercentage, isEligible, matchingSkills.length)
      }
    })

    // Filter and sort jobs
    const { minMatch = 20, sortBy = 'recommendation' } = req.query
    
    let filteredJobs = jobsWithMatches.filter(job => 
      job.skillMatch && job.matchPercentage >= parseInt(minMatch)
    )

    // Sort jobs based on criteria
    switch (sortBy) {
      case 'match':
        filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage)
        break
      case 'eligible':
        filteredJobs.sort((a, b) => {
          if (a.isEligible && !b.isEligible) return -1
          if (!a.isEligible && b.isEligible) return 1
          return b.matchPercentage - a.matchPercentage
        })
        break
      case 'recommendation':
      default:
        filteredJobs.sort((a, b) => b.recommendationScore - a.recommendationScore)
        break
    }

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const paginatedJobs = filteredJobs.slice(skip, skip + limit)

    // Get skill analysis
    const skillAnalysis = analyzeStudentSkills(profile.skills, allJobs)

    res.json({
      jobs: paginatedJobs,
      pagination: {
        current: page,
        pages: Math.ceil(filteredJobs.length / limit),
        total: filteredJobs.length
      },
      stats: {
        totalJobs: allJobs.length,
        matchedJobs: filteredJobs.length,
        eligibleJobs: filteredJobs.filter(job => job.isEligible).length,
        highMatchJobs: filteredJobs.filter(job => job.matchPercentage >= 70).length
      },
      studentProfile: {
        skills: profile.skills,
        skillCount: profile.skills.length,
        cgpa: profile.cgpa,
        graduationYear: profile.graduationYear
      },
      skillAnalysis,
      filters: {
        minMatch: parseInt(minMatch),
        sortBy
      }
    })
  } catch (error) {
    console.error('Get matched jobs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper function to check job eligibility
function checkJobEligibility(profile, eligibility) {
  if (!eligibility) return true
  
  let eligible = true
  
  if (eligibility.minCgpa && profile.cgpa < eligibility.minCgpa) {
    eligible = false
  }
  
  if (eligibility.graduationYear && eligibility.graduationYear.length > 0) {
    if (!eligibility.graduationYear.includes(profile.graduationYear)) {
      eligible = false
    }
  }
  
  return eligible
}

// Helper function to calculate recommendation score
function calculateRecommendationScore(matchPercentage, isEligible, matchingSkillsCount) {
  let score = matchPercentage
  
  // Boost score for eligible jobs
  if (isEligible) {
    score += 20
  }
  
  // Boost score based on number of matching skills
  score += Math.min(matchingSkillsCount * 5, 25)
  
  return Math.min(score, 100)
}

// Helper function to analyze student skills
function analyzeStudentSkills(studentSkills, allJobs) {
  const allJobSkills = allJobs.reduce((acc, job) => {
    if (job.requiredSkills) {
      acc.push(...job.requiredSkills)
    }
    return acc
  }, [])
  
  const skillFrequency = {}
  allJobSkills.forEach(skill => {
    const normalizedSkill = skill.toLowerCase()
    skillFrequency[normalizedSkill] = (skillFrequency[normalizedSkill] || 0) + 1
  })
  
  // Find marketable skills (skills student has that are in demand)
  const marketableSkills = studentSkills.filter(skill => 
    skillFrequency[skill.toLowerCase()] > 0
  )
  
  // Find recommended skills (high frequency but student doesn't have)
  const studentSkillsLower = studentSkills.map(s => s.toLowerCase())
  const recommendedSkills = Object.entries(skillFrequency)
    .filter(([skill, freq]) => freq >= 3 && !studentSkillsLower.includes(skill))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, freq]) => ({ skill, demand: freq }))
  
  return {
    totalSkills: studentSkills.length,
    marketableSkills: marketableSkills.length,
    marketableSkillsList: marketableSkills,
    recommendedSkills,
    skillMarketability: marketableSkills.length / Math.max(studentSkills.length, 1) * 100
  }
}

module.exports = router