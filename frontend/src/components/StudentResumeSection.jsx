import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PDFViewer from './PDFViewer'
import { Eye, Upload, FileText, AlertCircle, CheckCircle, ExternalLink, Download } from 'lucide-react'
import { generatePDFUrls, extractUserIdFromResumeUrl } from '../utils/pdfUtils'

const StudentResumeSection = () => {
  const [resumeInfo, setResumeInfo] = useState({ hasResume: false })
  const [showViewer, setShowViewer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchResumeInfo()
  }, [])

  const fetchResumeInfo = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/upload/resume-info')
      setResumeInfo(response.data)
    } catch (error) {
      console.error('Error fetching resume info:', error)
      if (error.response?.status !== 404) {
        setError('Failed to check resume status')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Checking resume status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-4 ${
      resumeInfo.hasResume 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="text-2xl">
            {resumeInfo.hasResume ? '📄' : '⚠️'}
          </div>
        </div>
        <div className="ml-3 flex-1">
          {resumeInfo.hasResume ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resume Uploaded Successfully
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your resume is ready for faculty verification: {resumeInfo.filename}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowViewer(!showViewer)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-800 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {showViewer ? 'Hide' : 'View'} Resume
                  </button>
                  {(() => {
                    const userId = resumeInfo.userId || extractUserIdFromResumeUrl(resumeInfo.resumeUrl)
                    const pdfUrls = generatePDFUrls(resumeInfo.resumeUrl, userId)
                    
                    return (
                      <a
                        href={pdfUrls.view}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-800 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open PDF
                      </a>
                    )
                  })()}
                </div>
              </div>
              
              {/* Resume Viewer Options */}
              {showViewer && (
                <div className="mt-4 bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Resume Options</h4>
                    <button
                      onClick={() => setShowViewer(false)}
                      className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                    >
                      ✕ Close
                    </button>
                  </div>
                  
                  {(() => {
                    const userId = resumeInfo.userId || extractUserIdFromResumeUrl(resumeInfo.resumeUrl)
                    const pdfUrls = generatePDFUrls(resumeInfo.resumeUrl, userId)
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <a 
                          href={pdfUrls.view} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          View in New Tab
                        </a>
                        <a 
                          href={pdfUrls.download}
                          download={resumeInfo.filename}
                          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download PDF
                        </a>
                      </div>
                    )
                  })()}

                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                    <p><strong>File:</strong> {resumeInfo.filename}</p>
                    <p className="text-xs mt-1">Click "View in New Tab" for the best PDF viewing experience</p>
                  </div>
                </div>
              )}
              
              <div className="mt-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-800 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  📝 Update Profile
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-medium text-yellow-800 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Complete Your Profile for Faculty Verification
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Faculty needs to review your profile and resume before approving you for job applications.</p>
                <div className="mt-3 flex space-x-2">
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload Resume & Complete Profile
                  </Link>
                </div>
              </div>
            </>
          )}
          
          {error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentResumeSection