const Job = require('../models/Job')
const StudentProfile = require('../models/StudentProfile')

class JobMatchingService {
  /**
   * Find jobs that match student's skills
   * @param {Object} studentProfile - Student profile with skills
   * @param {Object} options - Filtering options
   * @returns {Array} Array of matched jobs with match percentage
   */
  static async findMatchingJobs(studentProfile, options = {}) {
    try {
      const { minMatchPercentage = 30, limit = 20, sortBy = 'matchPercentage' } = options

      // Get all active jobs
      const jobs = await Job.find({ 
        status: 'open',
        deadline: { $gte: new Date() }
      })
        .populate('companyId', 'name companyName')
        .sort({ createdAt: -1 })

      if (!studentProfile.skills || studentProfile.skills.length === 0) {
        return []
      }

      const studentSkills = studentProfile.skills.map(skill => skill.toLowerCase())
      const matchedJobs = []

      for (const job of jobs) {
        const matchResult = this.calculateJobMatch(studentProfile, job, studentSkills)
        
        if (matchResult.matchPercentage >= minMatchPercentage) {
          matchedJobs.push({
            ...job.toObject(),
            matchDetails: matchResult,
            isEligible: this.checkEligibility(studentProfile, job.eligibility),
            recommendationScore: this.calculateRecommendationScore(matchResult, studentProfile, job)
          })
        }
      }

      // Sort by recommendation score or match percentage
      matchedJobs.sort((a, b) => {
        if (sortBy === 'recommendationScore') {
          return b.recommendationScore - a.recommendationScore
        }
        return b.matchDetails.matchPercentage - a.matchDetails.matchPercentage
      })

      return matchedJobs.slice(0, limit)
    } catch (error) {
      console.error('Error finding matching jobs:', error)
      throw error
    }
  }

  /**
   * Calculate how well a job matches a student's profile
   */
  static calculateJobMatch(studentProfile, job, studentSkills) {
    const jobSkills = job.requiredSkills || []
    const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase())

    // Find matching skills
    const matchingSkills = studentSkills.filter(studentSkill =>
      jobSkillsLower.some(jobSkill =>
        jobSkill.includes(studentSkill) || studentSkill.includes(jobSkill)
      )
    )

    // Find missing skills
    const missingSkills = jobSkillsLower.filter(jobSkill =>
      !studentSkills.some(studentSkill =>
        jobSkill.includes(studentSkill) || studentSkill.includes(jobSkill)
      )
    )

    // Calculate match percentage
    const matchPercentage = jobSkills.length > 0 
      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
      : 0

    // Calculate skill coverage (how many of student's skills are relevant)
    const skillCoverage = studentSkills.length > 0
      ? Math.round((matchingSkills.length / studentSkills.length) * 100)
      : 0

    return {
      matchingSkills,
      missingSkills,
      matchPercentage,
      skillCoverage,
      totalRequiredSkills: jobSkills.length,
      totalMatchingSkills: matchingSkills.length
    }
  }

  /**
   * Check if student meets job eligibility criteria
   */
  static checkEligibility(studentProfile, eligibility) {
    if (!eligibility) return true

    // Check CGPA requirement
    if (eligibility.minCgpa && studentProfile.cgpa < eligibility.minCgpa) {
      return false
    }

    // Check graduation year requirement
    if (eligibility.graduationYear && eligibility.graduationYear.length > 0) {
      if (!eligibility.graduationYear.includes(studentProfile.graduationYear)) {
        return false
      }
    }

    // Check department requirement
    if (eligibility.departments && eligibility.departments.length > 0) {
      // Get user department from populated userId
      const userDepartment = studentProfile.userId?.department
      if (userDepartment && !eligibility.departments.includes(userDepartment)) {
        return false
      }
    }

    return true
  }

  /**
   * Calculate overall recommendation score
   */
  static calculateRecommendationScore(matchResult, studentProfile, job) {
    let score = 0

    // Base score from skill match (40 points)
    score += (matchResult.matchPercentage / 100) * 40

    // Bonus for high skill coverage (20 points)
    score += (matchResult.skillCoverage / 100) * 20

    // Bonus for eligibility (20 points)
    if (this.checkEligibility(studentProfile, job.eligibility)) {
      score += 20
    }

    // Bonus for recent job postings (10 points)
    const daysSincePosted = (new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24)
    if (daysSincePosted <= 7) {
      score += 10
    } else if (daysSincePosted <= 30) {
      score += 5
    }

    // Bonus for job type preference (10 points)
    // This could be enhanced with student preferences
    if (job.jobType === 'full-time') {
      score += 5
    }

    return Math.round(score)
  }

  /**
   * Get skill-based job recommendations for approved students
   */
  static async getJobRecommendations(userId, options = {}) {
    try {
      // Get student profile
      const studentProfile = await StudentProfile.findOne({ userId })
        .populate('userId', 'name email department verificationStatus isVerified')

      if (!studentProfile) {
        throw new Error('Student profile not found')
      }

      // Check if student is verified
      if (!studentProfile.userId.isVerified || studentProfile.userId.verificationStatus !== 'approved') {
        return {
          message: 'Student must be approved by faculty to view job recommendations',
          recommendations: [],
          studentStatus: {
            isVerified: studentProfile.userId.isVerified,
            verificationStatus: studentProfile.userId.verificationStatus
          }
        }
      }

      // Get matching jobs
      const matchingJobs = await this.findMatchingJobs(studentProfile, options)

      // Categorize recommendations
      const categories = {
        perfectMatch: matchingJobs.filter(job => job.matchDetails.matchPercentage >= 80),
        goodMatch: matchingJobs.filter(job => job.matchDetails.matchPercentage >= 60 && job.matchDetails.matchPercentage < 80),
        partialMatch: matchingJobs.filter(job => job.matchDetails.matchPercentage >= 30 && job.matchDetails.matchPercentage < 60)
      }

      return {
        recommendations: matchingJobs,
        categories,
        studentProfile: {
          skills: studentProfile.skills,
          skillCount: studentProfile.skills?.length || 0,
          isProfileComplete: studentProfile.isProfileComplete
        },
        stats: {
          totalRecommendations: matchingJobs.length,
          perfectMatches: categories.perfectMatch.length,
          goodMatches: categories.goodMatch.length,
          partialMatches: categories.partialMatch.length
        }
      }
    } catch (error) {
      console.error('Error getting job recommendations:', error)
      throw error
    }
  }

  /**
   * Get trending skills based on job postings
   */
  static async getTrendingSkills(limit = 10) {
    try {
      const jobs = await Job.find({ 
        status: 'open',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })

      const skillFrequency = {}
      
      jobs.forEach(job => {
        if (job.requiredSkills) {
          job.requiredSkills.forEach(skill => {
            const normalizedSkill = skill.toLowerCase().trim()
            skillFrequency[normalizedSkill] = (skillFrequency[normalizedSkill] || 0) + 1
          })
        }
      })

      const trendingSkills = Object.entries(skillFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([skill, count]) => ({
          skill: skill.charAt(0).toUpperCase() + skill.slice(1),
          demand: count,
          percentage: Math.round((count / jobs.length) * 100)
        }))

      return trendingSkills
    } catch (error) {
      console.error('Error getting trending skills:', error)
      throw error
    }
  }
}

module.exports = JobMatchingService