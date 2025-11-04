import { useState, useEffect } from 'react'
import { Eye, Download, ExternalLink, AlertCircle } from 'lucide-react'

const PDFViewer = ({ pdfUrl, filename = 'document.pdf', className = '' }) => {
  const [viewMethod, setViewMethod] = useState('direct')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [pdfExists, setPdfExists] = useState(false)

  useEffect(() => {
    checkPdfExists()
  }, [pdfUrl])

  const checkPdfExists = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(pdfUrl, { method: 'HEAD' })
      setPdfExists(response.ok)
      
      if (!response.ok) {
        console.error('PDF not accessible:', response.status, response.statusText)
        setHasError(true)
      }
    } catch (error) {
      console.error('Error checking PDF:', error)
      setPdfExists(false)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getViewerUrl = () => {
    const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`
    
    switch (viewMethod) {
      case 'pdfjs':
        return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fullUrl)}`
      case 'google':
        return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`
      case 'cloudinary':
        // For Cloudinary URLs, ensure proper viewing format
        if (fullUrl.includes('cloudinary.com')) {
          // Remove attachment flag for inline viewing
          return fullUrl.replace('/upload/fl_attachment/', '/upload/')
        }
        return fullUrl
      case 'direct':
      default:
        // For direct viewing, ensure proper format
        if (fullUrl.includes('cloudinary.com')) {
          return fullUrl.replace('/upload/fl_attachment/', '/upload/')
        }
        return fullUrl
    }
  }

  if (isLoading) {
    return (
      <div className={`border rounded-lg p-8 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PDF...</p>
      </div>
    )
  }

  if (hasError || !pdfExists) {
    return (
      <div className={`border rounded-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Not Available</h3>
        <p className="text-gray-600 mb-4">
          The PDF file could not be loaded. This might be due to:
        </p>
        <ul className="text-sm text-gray-500 mb-6 text-left max-w-md mx-auto">
          <li>• File not found on server</li>
          <li>• Network connectivity issues</li>
          <li>• Browser security restrictions</li>
          <li>• File corruption</li>
        </ul>
        <div className="space-x-2">
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Try Direct Link
          </a>
          <button
            onClick={checkPdfExists}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Viewer Controls */}
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">PDF Viewer:</span>
          <select
            value={viewMethod}
            onChange={(e) => setViewMethod(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="direct">Direct View</option>
            <option value="cloudinary">Cloudinary Optimized</option>
            <option value="pdfjs">PDF.js Viewer</option>
            <option value="google">Google Docs Viewer</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{filename}</span>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <a 
            href={pdfUrl} 
            download={filename}
            className="text-green-600 hover:text-green-800"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative">
        <iframe
          src={getViewerUrl()}
          className="w-full h-96 border-0"
          title={`PDF Viewer - ${filename}`}
          onLoad={() => {
            console.log(`PDF loaded successfully with ${viewMethod} method`)
            setHasError(false)
          }}
          onError={(e) => {
            console.error(`PDF loading error with ${viewMethod} method:`, e)
            setHasError(true)
          }}
        />
        
        {/* Loading overlay */}
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading PDF with {viewMethod} viewer...</p>
          </div>
        </div>
      </div>

      {/* Fallback message */}
      <div className="bg-gray-50 px-4 py-2 text-center">
        <p className="text-xs text-gray-500">
          If the PDF doesn't display, try switching viewers above or{' '}
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            open in new tab
          </a>
        </p>
      </div>
    </div>
  )
}

export default PDFViewer