import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { 
  Users, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MessageSquare,
  Calendar,
  Award
} from 'lucide-react'

const CompanyApplications = () => {
  const { jobId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [applications, setApplications] = useState([])
  const [stageStats, setStageStats] = useState({})
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedApplications, setSelectedApplications] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [filters, setFilters] = useState({
    stage: searchParams.get('stage') || '',
    page: parseInt(searchParams.get('page')) || 1
  })

  useEffect(() => {
    fetchApplications()
    fetchJobDetails()
  }, [jobId, filters])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await axios.get(`/api/applications/job/${jobId}?${params}`)
      setApplications(response.data.applications)
      setStageStats(response.data.stageStats)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${jobId}`)
      setJob(response.data)
    } catch (error) {
      console.error('Error fetching job details:', error)
    }
  }

  const updateApplicationStage = async (applicationId, stage, reason = '') => {
    try {
      await axios.patch(`/api/applications/${applicationId}/stage`, { stage, reason })
      fetchApplications()
    } catch (error) {
      console.error('Error updating application stage:', error)
      alert('Failed to update application stage')
    }
  }

  const bulkUpdateStages = async () => {
    if (!bulkAction || selectedApplications.length === 0) return

    const reason = prompt('Enter reason for this action (optional):')
    
    try {
      await axios.patch('/api/applications/bulk-update', {
        applicationIds: selectedApplications,
        stage: bulkAction,
        reason
      })
      
      setSelectedApplications([])
      setBulkAction('')
      fetchApplications()
      alert(`${selectedApplications.length} applications updated successfully`)
    } catch (error) {
      console.error('Error bulk updating applications:', error)
      alert('Failed to update applications')
    }
  }

  const addReview = async (applicationId, scores, note) => {
    try {
      await axios.post(`/api/applications/${applicationId}/review`, { scores, note })
      fetchApplications()
    } catch (error) {
      console.error('Error adding review:', error)
      alert('Failed to add review')
    }
  }

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-purple-100 text-purple-800',
      offered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const selectAllApplications = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(applications.map(app => app._id))
    }
  }

  if (loading && applications.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          {job && (
            <p className="text-gray-600">
              {job.title} • {applications.length} applications
            </p>
          )}
        </div>
        <button
          onClick={() => alert('Export functionality would be implemented here')}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Stage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(stageStats).map(([stage, count]) => (
          <div
            key={stage}
            className={`p-4 rounded-lg border-2 cursor-pointer transition ${
              filters.stage === stage 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFilters({ ...filters, stage: filters.stage === stage ? '' : stage })}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{stage}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedApplications.length} applications selected
            </span>
            <div className="flex items-center space-x-4">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Action</option>
                <option value="shortlisted">Shortlist</option>
                <option value="interview">Move to Interview</option>
                <option value="offered">Make Offer</option>
                <option value="rejected">Reject</option>
              </select>
              <button
                onClick={bulkUpdateStages}
                disabled={!bulkAction}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Applications</h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedApplications.length === applications.length && applications.length > 0}
                  onChange={selectAllApplications}
                  className="mr-2"
                />
                Select All
              </label>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <ApplicationRow
                  key={application._id}
                  application={application}
                  isSelected={selectedApplications.includes(application._id)}
                  onSelect={() => toggleApplicationSelection(application._id)}
                  onUpdateStage={updateApplicationStage}
                  onAddReview={addReview}
                  getStageColor={getStageColor}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const ApplicationRow = ({ 
  application, 
  isSelected, 
  onSelect, 
  onUpdateStage, 
  onAddReview, 
  getStageColor 
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showScoreForm, setShowScoreForm] = useState(false)
  const [scores, setScores] = useState({
    aptitude: application.scores?.aptitude || '',
    technical: application.scores?.technical || '',
    communication: application.scores?.communication || ''
  })
  const [note, setNote] = useState('')

  const handleScoreSubmit = (e) => {
    e.preventDefault()
    onAddReview(application._id, scores, note)
    setShowScoreForm(false)
    setNote('')
  }

  return (
    <>
      <tr className={isSelected ? 'bg-blue-50' : ''}>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium">
                  {application.studentId?.name?.charAt(0) || 'N'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {application.studentId?.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                {application.studentId?.email || 'N/A'}
              </div>
              <div className="text-xs text-gray-400">
                {application.studentId?.department || 'N/A'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={application.stage}
            onChange={(e) => onUpdateStage(application._id, e.target.value)}
            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStageColor(application.stage)}`}
          >
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(application.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {application.scores?.aptitude ? (
            <div className="space-y-1">
              <div>Apt: {application.scores.aptitude}</div>
              <div>Tech: {application.scores.technical || 'N/A'}</div>
              <div>Comm: {application.scores.communication || 'N/A'}</div>
            </div>
          ) : (
            <button
              onClick={() => setShowScoreForm(true)}
              className="text-blue-600 hover:text-blue-900 text-xs"
            >
              Add Scores
            </button>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowScoreForm(true)}
            className="text-green-600 hover:text-green-900"
          >
            <Star className="w-4 h-4" />
          </button>
        </td>
      </tr>

      {/* Expanded Details */}
      {showDetails && (
        <tr>
          <td colSpan="6" className="px-6 py-4 bg-gray-50">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                <p className="text-sm text-gray-700">{application.coverLetter}</p>
              </div>
              
              {application.resumeUrl && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Resume</h4>
                  <a
                    href={`/api/upload/pdf/public/${application.userId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-900 text-sm"
                  >
                    📄 View Resume
                  </a>
                </div>
              )}

              {application.reviewerNotes?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
                  <div className="space-y-2">
                    {application.reviewerNotes.map((note, index) => (
                      <div key={index} className="text-sm text-gray-700 bg-white p-2 rounded">
                        <p>{note.note}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* Score Form */}
      {showScoreForm && (
        <tr>
          <td colSpan="6" className="px-6 py-4 bg-yellow-50">
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <h4 className="font-medium text-gray-900">Add/Update Scores</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aptitude (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.aptitude}
                    onChange={(e) => setScores({ ...scores, aptitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technical (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.technical}
                    onChange={(e) => setScores({ ...scores, technical: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Communication (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.communication}
                    onChange={(e) => setScores({ ...scores, communication: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your review notes..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowScoreForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </td>
        </tr>
      )}
    </>
  )
}

export default CompanyApplications