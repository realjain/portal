import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  FileText,
  Award,
  AlertCircle
} from 'lucide-react'

const FacultyDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingVerifications: 0,
    approvedStudents: 0,
    rejectedStudents: 0
  })
  const [students, setStudents] = useState([])
  const [recentVerifications, setRecentVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDetailedModal, setShowDetailedModal] = useState(false)
  const [studentDetails, setStudentDetails] = useState(null)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showResumeViewer, setShowResumeViewer] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    fetchStudents()
  }, [filter])

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...')
      const response = await axios.get('/api/faculty/dashboard')
      console.log('Dashboard data response:', response.data)
      setStats(response.data.stats)
      setRecentVerifications(response.data.recentVerifications)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      console.error('Error details:', error.response?.data)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      console.log(`Fetching students with filter: ${filter}`)
      const response = await axios.get(`/api/faculty/students?status=${filter}`)
      console.log('Students response:', response.data)
      setStudents(response.data.students)
    } catch (error) {
      console.error('Error fetching students:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (studentId, action) => {
    try {
      await axios.patch(`/api/faculty/students/${studentId}/verify`, {
        action,
        notes: verificationNotes
      })
      
      setShowModal(false)
      setShowDetailedModal(false)
      setSelectedStudent(null)
      setStudentDetails(null)
      setVerificationNotes('')
      fetchDashboardData()
      fetchStudents()
      
      alert(`Student ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
    } catch (error) {
      console.error('Error verifying student:', error)
      alert('Failed to update student verification status')
    }
  }

  const openVerificationModal = (student) => {
    setSelectedStudent(student)
    setShowModal(true)
    setVerificationNotes('')
  }

  const openDetailedModal = async (student) => {
    setSelectedStudent(student)
    setShowDetailedModal(true)
    setLoadingDetails(true)
    
    try {
      console.log(`Fetching detailed profile for student: ${student._id}`)
      const response = await axios.get(`/api/faculty/students/${student._id}`)
      console.log('Student details response:', response.data)
      setStudentDetails(response.data)
    } catch (error) {
      console.error('Error fetching student details:', error)
      alert('Failed to load student details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    }
    return icons[status] || AlertCircle
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-gray-600">Verify and manage student applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4 mb-6">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status} Students
            </button>
          ))}
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Filter: {filter}</p>
          <p>Students found: {students.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Stats: Total={stats.totalStudents}, Pending={stats.pendingVerifications}</p>
        </div>

        {/* Students List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No {filter} students found.</p>
              <p className="text-sm text-gray-400">
                {filter === 'pending' ? 'All students have been verified.' : 
                 filter === 'approved' ? 'No students have been approved yet.' :
                 'No students have been rejected yet.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const StatusIcon = getStatusIcon(student.verificationStatus)
                  return (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {student.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              {student.hasCompleteProfile ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Complete Profile
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  ✗ Incomplete
                                </span>
                              )}
                              {student.hasResume && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  📄 Resume
                                </span>
                              )}
                              {student.skillCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  {student.skillCount} Skills
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.department}</div>
                        {student.skillMatches && student.skillMatches.length > 0 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              🎯 {student.skillMatches.length} Job Matches
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.verificationStatus)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {student.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openDetailedModal(student)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View detailed profile and job matches"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {student.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedStudent(student)
                                handleVerification(student._id, 'approve')
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Quick approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDetailedModal(student)}
                              className="text-red-600 hover:text-red-900"
                              title="Review before decision"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Verifications */}
      {recentVerifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Verifications</h3>
          <div className="space-y-3">
            {recentVerifications.map((verification, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{verification.name}</p>
                  <p className="text-sm text-gray-600">{verification.email}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(verification.verificationStatus)}`}>
                    {verification.verificationStatus}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(verification.verificationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Student Profile Modal */}
      {showDetailedModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  Student Profile: {selectedStudent.name}
                </h3>
                <button
                  onClick={() => setShowDetailedModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {loadingDetails ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading student details...</span>
                </div>
              ) : studentDetails ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Basic Information</h4>
                      <p><strong>Name:</strong> {studentDetails.student.name}</p>
                      <p><strong>Email:</strong> {studentDetails.student.email}</p>
                      <p><strong>Department:</strong> {studentDetails.student.department}</p>
                      <p><strong>Status:</strong> {studentDetails.student.verificationStatus}</p>
                    </div>
                    
                    {studentDetails.profile && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Academic Info</h4>
                        <p><strong>Program:</strong> {studentDetails.profile.program}</p>
                        <p><strong>Graduation Year:</strong> {studentDetails.profile.graduationYear}</p>
                        <p><strong>CGPA:</strong> {studentDetails.profile.cgpa}</p>
                        <p><strong>Profile Complete:</strong> {studentDetails.profile.isProfileComplete ? '✅ Yes' : '❌ No'}</p>
                      </div>
                    )}
                  </div>

                  {/* AI Recommendation */}
                  {studentDetails.verificationRecommendation && (
                    <div className={`p-4 rounded-lg border-l-4 ${
                      studentDetails.verificationRecommendation.recommendation === 'approve' 
                        ? 'bg-green-50 border-green-400' 
                        : studentDetails.verificationRecommendation.recommendation === 'conditional'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-red-50 border-red-400'
                    }`}>
                      <h4 className="font-semibold mb-2">
                        🤖 AI Recommendation: {studentDetails.verificationRecommendation.recommendation.toUpperCase()}
                      </h4>
                      <p className="text-sm mb-2">
                        <strong>Score:</strong> {studentDetails.verificationRecommendation.score}/100
                      </p>
                      <p className="text-sm mb-2">
                        <strong>Reason:</strong> {studentDetails.verificationRecommendation.reason}
                      </p>
                      {studentDetails.verificationRecommendation.suggestions.length > 0 && (
                        <div>
                          <strong className="text-sm">Suggestions:</strong>
                          <ul className="text-sm list-disc list-inside mt-1">
                            {studentDetails.verificationRecommendation.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  {studentDetails.profile?.skills && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Skills ({studentDetails.profile.skills.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {studentDetails.profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Matches */}
                  {studentDetails.jobMatches && studentDetails.jobMatches.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Job Market Analysis ({studentDetails.jobMatches.length} matches)</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {studentDetails.jobMatches.slice(0, 5).map((job, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">{job.title}</h5>
                                <p className="text-sm text-gray-600">{job.company}</p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  job.matchPercentage >= 80 ? 'bg-green-100 text-green-800' :
                                  job.matchPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {job.matchPercentage}% Match
                                </span>
                                {job.isEligible && (
                                  <div className="text-xs text-green-600 mt-1">✓ Eligible</div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-gray-600">
                                <strong>Matching Skills:</strong> {job.matchingSkills.join(', ')}
                              </p>
                              {job.missingSkills.length > 0 && (
                                <p className="text-xs text-red-600">
                                  <strong>Missing Skills:</strong> {job.missingSkills.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Resume</h4>
                    {studentDetails.profile?.resumeUrl ? (
                      <div className="space-y-3">
                        {(() => {
                          // Use backend PDF endpoint for proper viewing
                          // studentDetails.student._id is the user ID we need for the PDF endpoint
                          const studentUserId = studentDetails.student?._id
                          
                          if (!studentUserId) {
                            console.error('No student user ID found in studentDetails:', studentDetails)
                            return <div className="text-red-600">Error: Cannot load PDF - missing student ID</div>
                          }
                          
                          const viewUrl = `/api/upload/pdf/public/${studentUserId}`
                          
                          return (
                            <>
                              <div className="flex space-x-3">
                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  📄 View Resume (New Tab)
                                </a>
                                <button
                                  onClick={() => setShowResumeViewer(!showResumeViewer)}
                                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  👁️ {showResumeViewer ? 'Hide' : 'Show'} Resume Here
                                </button>
                              </div>
                              
                              {showResumeViewer && (
                                <div className="border rounded-lg overflow-hidden bg-white">
                                  <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 flex justify-between items-center">
                                    <span>Resume Preview - {studentDetails.profile.resumeFilename || 'resume.pdf'}</span>
                                    <a
                                      href={viewUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      Open in New Tab →
                                    </a>
                                  </div>
                                  <iframe
                                    src={viewUrl}
                                    className="w-full h-96"
                                    title="Student Resume"
                                    style={{ border: 'none' }}
                                  />
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="font-medium text-red-600 mb-2">No Resume Uploaded</p>
                        <p className="text-sm">Student needs to upload their resume to complete profile verification</p>
                        <p className="text-xs mt-2 text-gray-400">
                          Students can upload resumes in their Profile page
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Projects */}
                  {studentDetails.profile?.projects && studentDetails.profile.projects.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Projects ({studentDetails.profile.projects.length})</h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {studentDetails.profile.projects.map((project, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <h5 className="font-medium">{project.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                            {project.technologies && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.technologies.map((tech, techIndex) => (
                                  <span key={techIndex} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Notes Input */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Notes
                    </label>
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes about your verification decision..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleVerification(selectedStudent._id, 'approve')}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 flex items-center justify-center font-medium"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Student
                    </button>
                    <button
                      onClick={() => handleVerification(selectedStudent._id, 'reject')}
                      className="flex-1 bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 flex items-center justify-center font-medium"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Student
                    </button>
                    <button
                      onClick={() => setShowDetailedModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-400 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Failed to load student details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simple Verification Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verify Student: {selectedStudent.name}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Email: {selectedStudent.email}</p>
                <p className="text-sm text-gray-600 mb-2">Department: {selectedStudent.department}</p>
                <p className="text-sm text-gray-600 mb-4">Current Status: {selectedStudent.verificationStatus}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes (Optional)
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about the verification decision..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleVerification(selectedStudent._id, 'approve')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => handleVerification(selectedStudent._id, 'reject')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyDashboard