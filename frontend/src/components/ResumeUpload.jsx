import { useState, useEffect } from 'react'
import axios from 'axios'
import { Upload, FileText, Trash2, Download, AlertCircle, ExternalLink } from 'lucide-react'
import { generatePDFUrls, extractUserIdFromResumeUrl } from '../utils/pdfUtils'

const ResumeUpload = ({ className = '' }) => {
  const [resumeInfo, setResumeInfo] = useState({ hasResume: false })
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  useEffect(() => {
    fetchResumeInfo()
  }, [])

  const fetchResumeInfo = async () => {
    try {
      console.log('Fetching resume info...')
      const response = await axios.get('/api/upload/resume-info')
      console.log('Resume info response:', response.data)
      setResumeInfo(response.data)
    } catch (error) {
      console.error('Error fetching resume info:', error)
      console.error('Error response:', error.response?.data)
      
      // If error is 401/403, user might not be logged in
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Please login to view resume information')
      }
    }
  }

  const handleFileSelect = (file) => {
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file only')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    uploadResume(file)
  }

  const uploadResume = async (file) => {
    try {
      setUploading(true)
      setError('')
      setSuccess('')

      console.log('Uploading resume:', { name: file.name, size: file.size, type: file.type })

      const formData = new FormData()
      formData.append('resume', file)

      const response = await axios.post('/api/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      })

      console.log('Upload response:', response.data)
      setSuccess(`Resume uploaded successfully! File: ${response.data.filename}`)
      fetchResumeInfo()
    } catch (error) {
      console.error('Upload error:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'Failed to upload resume'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout - file may be too large'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const deleteResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return

    try {
      await axios.delete('/api/upload/resume')
      setSuccess('Resume deleted successfully!')
      setResumeInfo({ hasResume: false })
    } catch (error) {
      console.error('Delete error:', error)
      setError(error.response?.data?.message || 'Failed to delete resume')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        Resume Upload
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {resumeInfo.hasResume ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">Resume Uploaded</p>
                <p className="text-sm text-green-600">{resumeInfo.filename}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {(() => {
                const userId = resumeInfo.userId || extractUserIdFromResumeUrl(resumeInfo.resumeUrl)
                const pdfUrls = generatePDFUrls(resumeInfo.resumeUrl, userId)
                
                return (
                  <>
                    <a
                      href={pdfUrls.view}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View PDF
                    </a>

                    <button
                      onClick={deleteResume}
                      className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </>
                )
              })()}
            </div>
          </div>



          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Want to upload a new resume?</p>
            <label className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200">
              <Upload className="w-4 h-4 mr-2" />
              Replace Resume
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">Uploading resume...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload Your Resume
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop your PDF resume here, or click to browse
                </p>
                <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose PDF File
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Only PDF files are allowed</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Your resume will be visible to faculty for verification</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeUpload