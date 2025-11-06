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
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('student') // Default to student

  const { register, handleSubmit, formState: { errors } } = useForm()

  const handleRoleSelection = (role) => {
    setSelectedRole(role)
    setError('')
  }

  const onSubmit = async (data) => {
    try {
      setError('')
      setLoading(true)
      
      const email = data.email?.trim().toLowerCase()
      const password = data.password
      
      if (!email || !password) {
        setError('Email and password are required')
        return
      }
      
      console.log('Login form submitted:', { email, selectedRole })
      
      const user = await login(email, password)
      console.log('Login successful, navigating to dashboard. User role:', user.role)
      
      navigate('/dashboard')
    } catch (err) {
      console.error('Login form error:', err)
      let errorMessage = 'Login failed'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid email or password'
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid credentials'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getRoleInfo = (role) => {
    const roleData = {
      student: { title: 'Student', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700' },
      faculty: { title: 'Faculty', color: 'bg-green-600', hoverColor: 'hover:bg-green-700' },
      company: { title: 'Company', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700' },
      admin: { title: 'Admin', color: 'bg-red-600', hoverColor: 'hover:bg-red-700' }
    }
    return roleData[role] || roleData.student
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
          <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">Login to Your Account</h2>
          <p className="text-center text-gray-600 mb-6">Select your role and enter your credentials</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Role Selection Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleSelection(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Login Form */}
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
                placeholder="Enter your email"
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
              className={`w-full ${getRoleInfo(selectedRole).color} text-white py-3 px-4 rounded-lg ${getRoleInfo(selectedRole).hoverColor} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium transition-all duration-200 shadow-lg`}
            >
              {loading ? 'Signing in...' : `Sign In as ${getRoleInfo(selectedRole).title}`}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            New to the college portal?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login