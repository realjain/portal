const express = require('express')
const router = express.Router()
const JobMatchingService = require('../services/jobMatchingService')
const { auth, authorize } = require('../middleware/auth')
const { query } = require('express-validator')

// Get job recommendations for approved students
router.get('/jobs', [
  auth, 
  authorize('student'),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minMatch').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const { limit = 20, minMatch = 30, sortBy = 'recommendationScore' } = req.query

    const options = {
      limit: parseInt(limit),
      minMatchPercentage: parseInt(minMatch),
      sortBy
    }

    const result = await JobMatchingService.getJobRecommendations(req.user._id, options)

    res.json(result)
  } catch (error) {
    console.error('Get job recommendations error:', error)
    re