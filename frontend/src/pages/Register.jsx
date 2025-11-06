import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'

const Register = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('student') // Default to student

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  // Set initial role value
  useEffect(() => {
    setValue('role', selectedRole)
  }, [selectedRole, setValue])

  const handleRoleSelection = (role) => {
    setSelectedRole(role)
    setValue('role', role) // Ensure form knows about the role change
    setError('')
  }

  const onSubmit = async (data) => {
    try {
      setError('')
      setLoading(true)
      
      // Validate required fields based on role
      if ((selectedRole === 'student' || selectedRole === 'faculty') && !data.department) {
        setError(`Department is required for ${selectedRole}s`)
        return
      }
      
      if (selectedRole === 'company' && !data.companyName) {
        setError('Company name is required for companies')
        return
      }
      
      // Ensure role is set correctly and clean up data
      const formData = {
        name: data.name?.trim(),
        email: data.email?.trim().toLowerCase(),
        password: data.password,
        role: selectedRole
      }
      
      // Add role-specific fields
      if (selectedRole === 'student' || selectedRole === 'faculty') {
        formData.department = data.department
      } else if (selectedRole === 'company') {
        formData.companyName = data.companyName?.trim()
      }
      
      console.log('Registration form submitted:', { ...formData, password: '[HIDDEN]' })
      
      const user = await registerUser(formData)
      console.log('Registration successful, navigating to dashboard. User role:', user.role)
      
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration form error:', err)
      let errorMessage = 'Registration failed'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ')
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* College Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join College Portal</h1>
          <p className="text-gray-600 mt-2">Student Career & Placement Center</p>
          <p className="text-sm text-green-600 font-medium">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">Create New Account</h2>
          <p className="text-center text-gray-600 mb-6">Select your role and fill in your details</p>
          
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Create a strong password"
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

            {/* Role field - ensure it's properly set */}
            <input type="hidden" {...register('role')} value={selectedRole} />

            {(selectedRole === 'student' || selectedRole === 'faculty') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  {...register('department', { required: `Department is required for ${selectedRole}s` })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select your department</option>
                  <option value="Computer Science">💻 Computer Science</option>
                  <option value="Information Technology">🖥️ Information Technology</option>
                  <option value="Electronics">⚡ Electronics Engineering</option>
                  <option value="Mechanical">⚙️ Mechanical Engineering</option>
                  <option value="Civil">🏗️ Civil Engineering</option>
                  <option value="Electrical">🔌 Electrical Engineering</option>
                  <option value="Chemical">🧪 Chemical Engineering</option>
                  <option value="Biotechnology">🧬 Biotechnology</option>
                </select>
                {errors.department && (
                  <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
                )}
              </div>
            )}

            {selectedRole === 'company' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  {...register('companyName', { required: 'Company name is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your company name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${getRoleInfo(selectedRole).color} text-white py-3 px-4 rounded-lg ${getRoleInfo(selectedRole).hoverColor} focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 font-medium transition-all duration-200 shadow-lg`}
            >
              {loading ? 'Creating Account...' : `Create ${getRoleInfo(selectedRole).title} Account`}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:underline font-medium">
              Sign in here
            </Link>
          </p>

          {/* College Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              College Placement Portal
            </h3>
            <div className="text-xs text-gray-600">
              <p>🎯 Connect with top companies</p>
              <p>📈 Track your career progress</p>
              <p>🤝 Get placement assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register