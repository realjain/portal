// Utility functions for handling PDF URLs and viewing

/**
 * Generate a proper PDF viewing URL
 * @param {string} originalUrl - The original PDF URL
 * @param {Object} options - Options for URL generation
 * @param {boolean} options.forceDownload - Force download instead of inline viewing
 * @param {boolean} options.optimizeForViewing - Optimize URL for browser viewing
 * @returns {string} - Optimized PDF URL
 */
export const generatePDFViewUrl = (originalUrl, options = {}) => {
  if (!originalUrl) return ''
  
  const { forceDownload = false, optimizeForViewing = true } = options
  
  // Handle Cloudinary URLs
  if (originalUrl.includes('cloudinary.com')) {
    let url = originalUrl
    
    if (forceDownload) {
      // Add attachment flag for download
      if (!url.includes('/upload/fl_attachment/')) {
        url = url.replace('/upload/', '/upload/fl_attachment/')
      }
    } else if (optimizeForViewing) {
      // Remove attachment flag for inline viewing and add optimization
      url = url.replace('/upload/fl_attachment/', '/upload/')
      
      // Add PDF optimization parameters if not already present
      if (!url.includes('/upload/f_auto') && !url.includes('/upload/q_auto')) {
        url = url.replace('/upload/', '/upload/f_auto,q_auto/')
      }
    }
    
    return url
  }
  
  // Handle local server URLs
  if (originalUrl.startsWith('/api/upload/resume/')) {
    const baseUrl = originalUrl
    if (forceDownload) {
      return `${baseUrl}?download=true`
    }
    return `${baseUrl}?view=inline`
  }
  
  // Return original URL for other cases
  return originalUrl
}

/**
 * Generate a PDF viewer URL using the backend PDF endpoint
 * @param {string} userId - User ID
 * @returns {string} - PDF viewer URL
 */
export const generatePDFViewerUrl = (userId) => {
  if (!userId) return ''
  return `/api/upload/pdf/${userId}`
}

/**
 * Generate a download URL for a PDF
 * @param {string} originalUrl - The original PDF URL
 * @param {string} userId - User ID (optional, for backend endpoint)
 * @returns {string} - Download URL
 */
export const generatePDFDownloadUrl = (originalUrl, userId = null) => {
  if (userId) {
    return `/api/upload/resume/${userId}?download=true`
  }
  
  return generatePDFViewUrl(originalUrl, { forceDownload: true })
}

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com')
}

/**
 * Extract user ID from a resume URL if possible
 * @param {string} url - Resume URL
 * @returns {string|null} - User ID or null
 */
export const extractUserIdFromResumeUrl = (url) => {
  if (!url) return null
  
  // Try to extract from backend URL pattern
  const match = url.match(/\/api\/upload\/resume\/([^/?]+)/)
  return match ? match[1] : null
}

/**
 * Generate multiple URL variants for a PDF
 * @param {string} originalUrl - Original PDF URL
 * @param {string} userId - User ID (optional)
 * @returns {Object} - Object with different URL variants
 */
export const generatePDFUrls = (originalUrl, userId = null) => {
  // Always use the public PDF endpoint for proper inline viewing
  // This ensures all PDFs open inline instead of downloading
  const viewUrl = userId ? `/api/upload/pdf/public/${userId}` : `/api/upload/pdf/current`
  
  return {
    view: viewUrl,
    download: generatePDFDownloadUrl(originalUrl, userId),
    viewer: viewUrl,
    original: originalUrl
  }
}