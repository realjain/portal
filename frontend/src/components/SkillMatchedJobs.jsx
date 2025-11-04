import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Target, 
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Star,
  Filter,
  RefreshCw
} from 'lucide-react'

const SkillMatchedJobs = () => {
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({})
  const [skillAnalysis, setSkillAnalysis] = useState({})
  const [studentProfile, setStudentProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    minMatch: 20,
    sortBy: 'recommendation',
    page: 1
  })

  useEffect(() => {
    fetchMatchedJobs()
  }, [filters])

  const fetchMatchedJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        minMatch: filters.minMatch,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: 10
      })
      
      const response = await axios.get(`/api/jobs/matched?${params}`)
      
      if (response.data.requiresVerification) {
        setError('You must be verified by faculty to view matched jobs')
        return
      }
      
      if (response.data.skillsNeeded) {
        setError('Complete your profile with skills to see matched jobs')
        return
      }
      
      setJobs(response.data.jobs)
      setStats(response.data.stats)
      setSkillAnalysis(response.data.skillAnalysis)
      setStudentProfile(response.data.studentProfile)
      setError('')
    } catch (error) {
      console.error('Error fetching matched jobs:', error)
      if (error.response?.status === 403) {
        setError(error.response.data.message)
      } else {
        setError('Failed to load matched jobs')
      }
    } finally {
      setLoading(false)
    }
  }

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-blue-600 bg-blue-100'
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getMatchIcon = (percentage) => {
    if (percentage >= 80) return <Star className="w-4 h-4" />
    if (percentage >= 60) return <Target className="w-4 h-4" />
    if (percentage >= 40) return <TrendingUp className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Access Restricted</h3>
        <p className="text-red-600 mb-4">{error}</p>
        {error.includes('verified') && (
          <p className="text-sm text-red-500">
            Please wait for faculty to verify your profile, or contact your faculty for assistance.
          </p>
        )}
        {error.includes('skills') && (
          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Complete Profile
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Matched to Your Skills</h1>
          <p className="text-gray-600">Personalized job recommendations based on your verified profile</p>
        </div>
        <button
          onClick={fetchMatchedJobs}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Matched Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.matchedJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Eligible Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.eligibleJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Match</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highMatchJobs || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Analysis */}
      {skillAnalysis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Your Skill Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Your Skills ({skillAnalysis.totalSkills})</h4>
              <div className="flex flex-wrap gap-2">
                {studentProfile.skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Marketable Skills ({skillAnalysis.marketableSkills})
              </h4>
              <div className="flex flex-wrap gap-2">
                {skillAnalysis.marketableSkillsList?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✓ {skill}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round(skillAnalysis.skillMarketability || 0)}% of your skills are in demand
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommended Skills to Learn</h4>
              <div className="space-y-1">
                {skillAnalysis.recommendedSkills?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{item.skill}</span>
                    <span className="text-xs text-gray-500">{item.demand} jobs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Min Match:</label>
            <select
              value={filters.minMatch}
              onChange={(e) => setFilters({...filters, minMatch: parseInt(e.target.value), page: 1})}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value={0}>Any Match</option>
              <option value={20}>20%+</option>
              <option value={40}>40%+</option>
              <option value={60}>60%+</option>
              <option value={80}>80%+</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value, page: 1})}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="recommendation">Recommended</option>
              <option value="match">Best Match</option>
              <option value="eligible">Eligible First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {jobs.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Jobs Found</h3>
            <p className="text-gray-600 mb-4">
              Try lowering the minimum match percentage or add more skills to your profile.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Skills
            </Link>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(job.matchPercentage)}`}>
                      {getMatchIcon(job.matchPercentage)}
                      <span className="ml-1">{job.matchPercentage}% Match</span>
                    </span>
                    {job.isEligible && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Eligible
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{job.company}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.jobType}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </span>
                    {job.salary && (
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Matching */}
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">
                      Your Matching Skills ({job.matchingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {job.matchingSkills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {job.missingSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-orange-700 mb-2">
                        Skills to Develop ({job.missingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {job.missingSkills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {job.missingSkills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{job.missingSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Award className="w-4 h-4" />
                  <span>Recommendation Score: {job.recommendationScore}/100</span>
                </div>
                <div className="space-x-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SkillMatchedJobs