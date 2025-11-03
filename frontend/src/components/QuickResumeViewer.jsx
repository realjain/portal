import { useState, useEffect } from 'react'
import axios from 'axios'
import { Eye, FileText, AlertCircle, X } from 'lucide-react'

const QuickResumeViewer = ({ className = '' }) => {
  const [resumeInfo, setResumeInfo] = useState({ hasResume: false })
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResumeInfo()
  }, [])

  const fetchResumeInfo = async () => {
    try {
      const response = await axios.get('/api/upload/resume-info')
      setResumeInfo(response.data)
    } catch (error) {
      console.error('Error fetching resume info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !resumeInfo.hasResume) {
    return null
  }

  return (
    <>
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Your Resume</p>
              <p className="text-xs text-blue-600">{resumeInfo.filename}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <Eye className="w-4 h-4 mr-1" />
            Quick View
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Resume Preview - {resumeInfo.filename}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 flex space-x-2">
              <a
                href={resumeInfo.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Open in New Tab
              </a>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={resumeInfo.resumeUrl}
                className="w-full h-96"
                title="Resume Preview"
              >
                <div className="p-4 text-center">
                  <p className="text-gray-600 mb-2">Your browser cannot display this PDF.</p>
                  <a 
                    href={resumeInfo.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </a>
                </div>
              </iframe>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default QuickResumeViewer