import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const TestBackend = () => {
  const { user } = useAuth()
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})

  const runTest = async (testName, testFunction) => {
    setLoading(prev => ({ ...prev, [testName]: true }))
    try {
      const result = await testFunction()
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }))
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: error.response?.data?.message || error.message 
        } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }))
    }
  }

  const testBackendHealth = async () => {
    const response = await axios.get('/api/jobs?limit=1')
    return { status: 'Backend is running!', data: response.data }
  }

  const testAuthentication = async () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found in localStorage')
    
    const response = await axios.get('/api/auth/me')
    return { 
      token: token.substring(0, 20) + '...', 
      user: response.data 
    }
  }

  const testProfile = async () => {
    const response = await axios.get('/api/profiles/me')
    return response.data
  }

  const ResultCard = ({ testName, result, isLoading }) => (
    <div className={`p-4 rounded-lg border ${
      result?.success ? 'bg-green-50 border-green-200' : 
      result?.success === false ? 'bg-red-50 border-red-200' : 
      'bg-gray-50 border-gray-200'
    }`}>
      <h3 className="font-semibold mb-2">{testName}</h3>
      {isLoading ? (
        <p className="text-blue-600">Running test...</p>
      ) : result ? (
        result.success ? (
          <div>
            <p className="text-green-600 font-medium">✅ Success</p>
            <pre className="mt-2 text-sm bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium">❌ Failed</p>
            <p className="text-red-600 text-sm mt-1">{result.error}</p>
          </div>
        )
      ) : (
        <p className="text-gray-500">Click the button to run this test</p>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Test Suite</h1>
        <p className="text-gray-600">Test your backend API endpoints and authentication</p>
        
        {user && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <strong>Logged in as:</strong> {user.name} ({user.email}) - {user.role}
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Token: {localStorage.getItem('token')?.substring(0, 30)}...
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <button
            onClick={() => runTest('Backend Health', testBackendHealth)}
            disabled={loading.backendHealth}
            className="w-full mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.backendHealth ? 'Testing...' : 'Test Backend Health'}
          </button>
          <ResultCard 
            testName="Backend Health Check" 
            result={results['Backend Health']} 
            isLoading={loading['Backend Health']}
          />
        </div>

        <div>
          <button
            onClick={() => runTest('Authentication', testAuthentication)}
            disabled={loading.authentication}
            className="w-full mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading.authentication ? 'Testing...' : 'Test Authentication'}
          </button>
          <ResultCard 
            testName="Authentication Test" 
            result={results['Authentication']} 
            isLoading={loading['Authentication']}
          />
        </div>

        <div className="md:col-span-2">
          <button
            onClick={() => runTest('Profile API', testProfile)}
            disabled={loading.profile}
            className="w-full mb-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading.profile ? 'Testing...' : 'Test Profile API'}
          </button>
          <ResultCard 
            testName="Profile API Test" 
            result={results['Profile API']} 
            isLoading={loading['Profile API']}
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <div className="text-sm space-y-1">
          <p><strong>Current User:</strong> {user ? `${user.name} (${user.role})` : 'Not logged in'}</p>
          <p><strong>Token Exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          <p><strong>Backend URL:</strong> {axios.defaults.baseURL || 'http://localhost:5000'}</p>
        </div>
      </div>
    </div>
  )
}

export default TestBackend