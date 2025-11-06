import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const AuthTest = () => {
  const { user, login, register, logout } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testDirectAPI = async () => {
    setLoading(true)
    setTestResults([])

    // Test 1: Direct API Registration
    try {
      const response = await axios.post('/api/auth/register', {
        name: 'API Test User',
        email: `apitest${Date.now()}@example.com`,
        password: 'password123',
        role: 'student',
        department: 'Computer Science'
      })
      addResult('Direct API Registration', true, 'Success', response.data)
    } catch (error) {
      addResult('Direct API Registration', false, error.response?.data?.message || error.message)
    }

    // Test 2: Direct API Login
    try {
      const response = await axios.post('/api/auth/login', {
        email: 'teststudent123@example.com',
        password: 'password123'
      })
      addResult('Direct API Login', true, 'Success', response.data)
    } catch (error) {
      addResult('Direct API Login', false, error.response?.data?.message || error.message)
    }

    setLoading(false)
  }

  const testAuthContext = async () => {
    setLoading(true)
    setTestResults([])

    // Test 1: Context Registration
    try {
      const userData = {
        name: 'Context Test User',
        email: `contexttest${Date.now()}@example.com`,
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science'
      }
      const result = await register(userData)
      addResult('Context Registration', true, 'Success', result)
    } catch (error) {
      addResult('Context Registration', false, error.response?.data?.message || error.message)
    }

    // Test 2: Context Login
    try {
      const result = await login('testfaculty123@example.com', 'password123')
      addResult('Context Login', true, 'Success', result)
    } catch (error) {
      addResult('Context Login', false, error.response?.data?.message || error.message)
    }

    setLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      {/* Current User Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Current User</h2>
        {user ? (
          <div className="space-y-1">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> <span className="bg-blue-100 px-2 py-1 rounded">{user.role}</span></p>
            <p><strong>Department:</strong> {user.department || 'N/A'}</p>
            <button 
              onClick={logout}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-gray-600">No user logged in</p>
        )}
      </div>

      {/* Test Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={testDirectAPI}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Direct API
        </button>
        <button
          onClick={testAuthContext}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Auth Context
        </button>
        <button
          onClick={clearResults}
          className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Running tests...</span>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                result.success 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{result.test}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? '✅ Success' : '❌ Failed'}
                  </span>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
              </div>
              <p className="text-sm mb-2">{result.message}</p>
              {result.data && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600">View Data</summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AuthTest