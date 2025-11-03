import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm()

  const onSubmit = async (data) => {
    try {
      setError('')
      setLoading(true)
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoCredentials = {
    student: { email: 'student@test.com', password: 'student123' },
    faculty: { email: 'faculty@test.com', password: 'faculty123' },
    company: { email: 'company@test.com', password: 'company123' },
    admin: { email: 'admin@portal.com', password: 'admin123' }
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setError('')
  }

  const handleDemoLogin = () => {
    const credentials = demoCredentials[selectedRole]
    setValue('email', credentials.email)
    setValue('password', credentials.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* College Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">College Portal</h1>
          <p className="text-gray-600 mt-2">Student Career & Placement Center</p>
          <p className="text-sm text-blue-600 font-medium">Sign in to access opportunities</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">Login to Your Account</h2>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 rounded-lg p-1">
            {['student', 'faculty', 'company', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`py-2 px-3 rounded-md text-sm font-medium capitalize transition-colors ${selectedRole === role
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                {role === 'student' ? '🎓 Student' :
                  role === 'faculty' ? '👨‍🏫 Faculty' :
                    role === 'company' ? '🏢 Company' : '👨‍💼 Admin'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your college email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium transition-all duration-200 shadow-lg"
            >
              {loading ? 'Signing in...' : `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>
          </form>

          {/* Quick Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium transition-colors"
          >
            🚀 Use Demo {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account
          </button>

          <p className="text-center mt-6 text-sm text-gray-600">
            New to the college portal?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Create Account
            </Link>
          </p>

          {/* Current Role Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal Access
            </h3>
            <div className="text-xs text-gray-600">
              <div><strong>Demo Credentials:</strong></div>
              <div className="font-mono bg-white px-3 py-2 rounded-lg mt-2 text-xs border">
                📧 {demoCredentials[selectedRole].email}<br />
                🔑 {demoCredentials[selectedRole].password}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login