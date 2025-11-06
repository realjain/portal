import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const AuthDebug = () => {
  const { user, login, register, logout, loading } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [testLoading, setTestLoading] = useState(false)

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  // Test 1: Direct API Registration
  const testDirectAPI = async () => {
    setTestLoading(true)
    const timestamp = Date.now()
    
    try {
      const response = await axios.post('/api/auth/register', {
        name: 'Direct API Test',
        email: `directapi${timestamp}@test.com`,
        password: 'password123',
        role: 'student',
        department: 'Computer Science'
      })
      
      addResult('Direct API Registration', true, 'Registration successful', response.data.user)
    } catch (error) {
      addResult('Direct API Registration', false, error.response?.data?.message || error.message)
    }
    
    setTestLoading(false)
  }

  // Test 2: AuthContext Registration
  const testContextRegistration = async () => {
    setTestLoading(true)
    const timestamp = Date.now()
    
    try {
      const userData = {
        name: 'Context Test User',
        email: `contexttest${timestamp}@test.com`,
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science'
      }
      
      const user = await register(userData)
      addResult('AuthContext Registration', true, 'Registration successful', user)
    } catch (error) {
      addResult('AuthContext Registration', false, error.response?.data?.message || error.message)
    }
    
    setTestLoading(false)
  }

  // Test 3: AuthContext Login
  const testContextLogin = async () => {
    setTestLoading(true)
    
    try {
      // First register a user to login with
      const timestamp = Date.now()
      const email = `logintest${timestamp}@test.com`
      
      await axios.post('/api/auth/register', {
        name: 'Login Test User',
        email: email,
        password: 'password123',
        role: 'company',
        companyName: 'Test Company'
      })
      
      // Now test login
      const user = await login(email, 'password123')
      addResult('AuthContext Login', true, 'Login successful', user)
    } catch (error) {
      addResult('AuthContext Login', false, error.response?.data?.message || error.message)
    }
    
    setTestLoading(false)
  }

  // Test 4: Form Simulation
  const testFormSimulation = async () => {
    setTestLoading(true)
    const timestamp = Date.now()
    
    try {
      // Simulate form data like the Register component would send
      const formData = {
        name: 'Form Test User',
        email: `formtest${timestamp}@test.com`,
        password: 'password123',
        role: 'admin'
      }
      
      console.log('Simulating form submission:', { ...formData, password: '[HIDDEN]' })
      
      const user = await register(formData)
      addResult('Form Simulation', true, 'Form registration successful', user)
    } catch (error) {
      addResult('Form Simulation', false, error.response?.data?.message || error.message)
    }
    
    setTestLoading(false)
  }

  // Test 5: Check Current User
  const testCurrentUser = async () => {
    setTestLoading(true)
    
    try {
      const response = await axios.get('/api/auth/me')
      addResult('Current User Check', true, 'User info retrieved', response.data)
    } catch (error) {
      addResult('Current User Check', false, error.response?.data?.message || error.message)
    }
    
    setTestLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Dashboard</h1>
      
      {/* Current User Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Authentication State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User Logged In:</strong> {user ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> <span className="bg-blue-100 px-2 py-1 rounded">{user.role}</span></p>
                <p><strong>Department:</strong> {user.department || 'N/A'}</p>
                <p><strong>Company:</strong> {user.companyName || 'N/A'}</p>
              </>
            )}
          </div>
          <div>
            <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
            <p><strong>Token Preview:</strong> {localStorage.getItem('token')?.substring(0, 30) + '...' || 'None'}</p>
            <div className="mt-4">
              {user ? (
                <button 
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              ) : (
                <p className="text-gray-600">No user to logout</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Tests</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={testDirectAPI}
            disabled={testLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Direct API
          </button>
          <button
            onClick={testContextRegistration}
            disabled={testLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Context Register
          </button>
          <button
            onClick={testContextLogin}
            disabled={testLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Context Login
          </button>
          <button
            onClick={testFormSimulation}
            disabled={testLoading}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
          >
            Form Simulation
          </button>
          <button
            onClick={testCurrentUser}
            disabled={testLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Check User
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={clearResults}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {testLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Running test...</span>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          {testResults.map((result) => (
            <div
              key={result.id}
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

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Navigation</h3>
        <div className="space-x-4">
          <a href="/register" className="text-blue-600 hover:underline">Register Page</a>
          <a href="/login" className="text-blue-600 hover:underline">Login Page</a>
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
          <a href="/auth-test" className="text-blue-600 hover:underline">Auth Test Page</a>
        </div>
      </div>
    </div>
  )
}

export default AuthDebug