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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      
      {/* Role Selection Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        {['student', 'company', 'admin'].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleRoleSelect(role)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-colors ${
              selectedRole === role
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {role}
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
            Email
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
        </button>
      </form>

      {/* Quick Demo Login Button */}
      <button
        type="button"
        onClick={handleDemoLogin}
        className="w-full mt-3 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
      >
        Use Demo {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Credentials
      </button>

      <p className="text-center mt-4 text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>

      {/* Current Role Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login
        </h3>
        <div className="text-xs text-gray-600">
          <div><strong>Demo:</strong> {demoCredentials[selectedRole].email} / {demoCredentials[selectedRole].password}</div>
        </div>
      </div>
    </div>
  )
}

export default Login