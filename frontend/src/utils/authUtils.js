// Authentication utility functions

export const clearAuthData = () => {
  // Clear all authentication-related data
  localStorage.removeItem('token')
  sessionStorage.clear()
  
  // Clear axios headers
  delete window.axios?.defaults?.headers?.common?.['Authorization']
  
  console.log('Authentication data cleared')
}

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
    // Set axios header if axios is available
    if (window.axios) {
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  } else {
    clearAuthData()
  }
}

export const getAuthToken = () => {
  return localStorage.getItem('token')
}

export const isTokenValid = (token) => {
  if (!token) return false
  
  try {
    // Basic JWT structure check
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Date.now() / 1000
    
    return payload.exp > currentTime
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

export const debugAuthState = () => {
  const token = getAuthToken()
  console.log('=== Auth Debug Info ===')
  console.log('Token exists:', !!token)
  console.log('Token valid:', isTokenValid(token))
  console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'None')
  console.log('LocalStorage keys:', Object.keys(localStorage))
  console.log('======================')
}