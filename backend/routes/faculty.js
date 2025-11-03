const express = require('express')
const router = express.Router()
const User = require('../models/User')
const StudentProfile = require('../models/StudentProfile')
const { auth, authorize } = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

// Get all students for verification (faculty only)
router.get('/students', [auth, authorize('faculty')], async (req, res) => {
  try {
    const { status, department, page = 1, limit = 20 } = req.query
    
    const query = { role: 'student' }
    
    // Filter by verification status
    if (status) {
      query.verificationStatus = status
    }
    
    // Filter by department (faculty can see their department students)
    if (department) {
      query.department = department
    }
    
    const students = await User.find(query)
      .populate('verifiedBy', 'name email')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    
    // Get available jobs for skill matching
    const Job = require('../models/Job')
    const activeJobs = await Job.find({ status: 'open' })
      .select('title company requiredSkills eligibility')
      .limit(50)
    
    // Get student profiles with skill matching
    const studentsWithProfiles = await Promise.all(
      students.map(async (student) => {
        const profile = await StudentProfile.findOne({ userId: student._id })
        
        let skillMatches = []
        let recommendedJobs = []
        
        if (profile && profile.skills && profile.skills.length > 0) {
          // Find jobs that match student skills
          activeJobs.forEach(job => {
            if (job.requiredSkills && job.requiredSkills.length > 0) {
              const matchingSkills = profile.skills.filter(skill => 
                job.requiredSkills.some(reqSkill => 
                  reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(reqSkill.toLowerCase())
                )
              )
              
              if (matchingSkills.length > 0) {
                const matchPercentage = Math.round((matchingSkills.length / job.requiredSkills.length) * 100)
                recommendedJobs.push({
                  jobId: job._id,
                  title: job.title,
                  company: job.company,
                  matchingSkills,
                  matchPercentage,
                  requiredSkills: job.requiredSkills
                })
              }
            }
          })
          
          // Sort by match percentage
          recommendedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage)
          skillMatches = recommendedJobs.slice(0, 5) // Top 5 matches
        }
        
        return {
          ...student.toObject(),
          profile: profile || null,
          skillMatches,
          hasCompleteProfile: profile?.isProfileComplete || false,
          hasResume: !!(profile?.resumeUrl),
          skillCount: profile?.skills?.length || 0,
          projectCount: profile?.projects?.length || 0
        }
      })
    )
    
    const total = await User.countDocuments(query)
    
    res.json({
      students: studentsWithProfiles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      availableJobs: activeJobs.length
    })
  } catch (error) {
    console.error('Get students error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Verify/Reject student (faculty only)
router.patch('/students/:studentId/verify', [
  auth,
  authorize('faculty'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const { studentId } = req.params
    const { action, notes } = req.body
    
    const student = await User.findById(studentId)
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' })
    }
    
    // Update verification status
    student.verificationStatus = action === 'approve' ? 'approved' : 'rejected'
    student.isVerified = action === 'approve'
    student.verifiedBy = req.user._id
    student.verificationDate = new Date()
    student.verificationNotes = notes || ''
    
    await student.save()
    
    // Populate the verifiedBy field for response
    await student.populate('verifiedBy', 'name email')
    
    res.json({
      message: `Student ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        verificationStatus: student.verificationStatus,
        isVerified: student.isVerified,
        verifiedBy: student.verifiedBy,
        verificationDate: student.verificationDate,
        verificationNotes: student.verificationNotes
      }
    })
  } catch (error) {
    console.error('Verify student error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get faculty dashboard stats
router.get('/dashboard', [auth, authorize('faculty')], async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' })
    const pendingVerifications = await User.countDocuments({ 
      role: 'student', 
      verificationStatus: 'pending' 
    })
    const approvedStudents = await User.countDocuments({ 
      role: 'student', 
      verificationStatus: 'approved' 
    })
    const rejectedStudents = await User.countDocuments({ 
      role: 'student', 
      verificationStatus: 'rejected' 
    })
    
    // Get recent verifications by this faculty
    const recentVerifications = await User.find({
      role: 'student',
      verifiedBy: req.user._id,
      verificationDate: { $exists: true }
    })
      .select('name email department verificationStatus verificationDate verificationNotes')
      .sort({ verificationDate: -1 })
      .limit(10)
    
    res.json({
      stats: {
        totalStudents,
        pendingVerifications,
        approvedStudents,
        rejectedStudents
      },
      recentVerifications
    })
  } catch (error) {
    console.error('Faculty dashboard error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get student details for verification
router.get('/students/:studentId', [auth, authorize('faculty')], async (req, res) => {
  try {
    const { studentId } = req.params
    
    const student = await User.findById(studentId)
      .populate('verifiedBy', 'name email')
      .select('-password')
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' })
    }
    
    // Get student profile
    const profile = await StudentProfile.findOne({ userId: studentId })
    
    // Get available jobs for skill matching
    const Job = require('../models/Job')
    const activeJobs = await Job.find({ status: 'open' })
      .select('title company requiredSkills eligibility location jobType salary')
    
    let jobMatches = []
    let skillAnalysis = {
      totalSkills: 0,
      marketableSkills: 0,
      recommendedSkills: [],
      strongAreas: [],
      improvementAreas: []
    }
    
    if (profile && profile.skills && profile.skills.length > 0) {
      skillAnalysis.totalSkills = profile.skills.length
      
      // Analyze skills against job market
      const allJobSkills = activeJobs.reduce((acc, job) => {
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
      
      // Check which student skills are in demand
      const marketableSkills = profile.skills.filter(skill => 
        skillFrequency[skill.toLowerCase()] > 0
      )
      skillAnalysis.marketableSkills = marketableSkills.length
      skillAnalysis.strongAreas = marketableSkills.slice(0, 5)
      
      // Find recommended skills (high frequency but student doesn't have)
      const studentSkillsLower = profile.skills.map(s => s.toLowerCase())
      const recommendedSkills = Object.entries(skillFrequency)
        .filter(([skill, freq]) => freq >= 3 && !studentSkillsLower.includes(skill))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill]) => skill)
      
      skillAnalysis.recommendedSkills = recommendedSkills
      
      // Find job matches
      activeJobs.forEach(job => {
        if (job.requiredSkills && job.requiredSkills.length > 0) {
          const matchingSkills = profile.skills.filter(skill => 
            job.requiredSkills.some(reqSkill => 
              reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(reqSkill.toLowerCase())
            )
          )
          
          const missingSkills = job.requiredSkills.filter(reqSkill =>
            !profile.skills.some(skill =>
              reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(reqSkill.toLowerCase())
            )
          )
          
          if (matchingSkills.length > 0) {
            const matchPercentage = Math.round((matchingSkills.length / job.requiredSkills.length) * 100)
            jobMatches.push({
              jobId: job._id,
              title: job.title,
              company: job.company,
              location: job.location,
              jobType: job.jobType,
              salary: job.salary,
              matchingSkills,
              missingSkills,
              matchPercentage,
              requiredSkills: job.requiredSkills,
              eligibility: job.eligibility,
              isEligible: checkEligibility(profile, job.eligibility)
            })
          }
        }
      })
      
      // Sort by match percentage and eligibility
      jobMatches.sort((a, b) => {
        if (a.isEligible && !b.isEligible) return -1
        if (!a.isEligible && b.isEligible) return 1
        return b.matchPercentage - a.matchPercentage
      })
    }
    
    res.json({
      student: student.toObject(),
      profile: profile || null,
      jobMatches: jobMatches.slice(0, 10), // Top 10 matches
      skillAnalysis,
      verificationRecommendation: generateVerificationRecommendation(profile, jobMatches, skillAnalysis)
    })
  } catch (error) {
    console.error('Get student details error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper function to check eligibility
function checkEligibility(profile, eligibility) {
  if (!eligibility || !profile) return true
  
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

// Helper function to generate verification recommendation
function generateVerificationRecommendation(profile, jobMatches, skillAnalysis) {
  if (!profile) {
    return {
      recommendation: 'reject',
      reason: 'No profile created',
      score: 0,
      suggestions: ['Student needs to create and complete their profile']
    }
  }
  
  if (!profile.isProfileComplete) {
    return {
      recommendation: 'reject',
      reason: 'Incomplete profile',
      score: 20,
      suggestions: ['Complete all profile sections', 'Add resume', 'Add projects']
    }
  }
  
  let score = 0
  const suggestions = []
  
  // Profile completeness (30 points)
  if (profile.isProfileComplete) score += 30
  if (profile.resumeUrl) score += 10
  if (profile.projects && profile.projects.length > 0) score += 10
  
  // Skills assessment (40 points)
  if (skillAnalysis.totalSkills >= 5) score += 20
  if (skillAnalysis.marketableSkills >= 3) score += 20
  
  // Job market fit (30 points)
  const goodMatches = jobMatches.filter(job => job.matchPercentage >= 60 && job.isEligible)
  if (goodMatches.length >= 3) score += 30
  else if (goodMatches.length >= 1) score += 15
  
  // Generate recommendation
  let recommendation = 'reject'
  let reason = 'Low overall score'
  
  if (score >= 80) {
    recommendation = 'approve'
    reason = 'Excellent profile with strong job market fit'
  } else if (score >= 60) {
    recommendation = 'approve'
    reason = 'Good profile with decent job prospects'
    suggestions.push('Consider adding more relevant skills')
  } else if (score >= 40) {
    recommendation = 'conditional'
    reason = 'Average profile, needs improvement'
    suggestions.push('Add more marketable skills', 'Complete more projects', 'Improve resume')
  } else {
    suggestions.push('Complete profile', 'Add relevant skills', 'Create projects', 'Upload resume')
  }
  
  if (skillAnalysis.recommendedSkills.length > 0) {
    suggestions.push(`Consider learning: ${skillAnalysis.recommendedSkills.slice(0, 3).join(', ')}`)
  }
  
  return {
    recommendation,
    reason,
    score,
    suggestions: suggestions.slice(0, 5)
  }
}

module.exports = router