import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Save, Shield, User, Settings, Mail, Phone, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const AdminProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setProfile(response.data)
      
      // Reset form with user data
      reset({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        title: response.data.title || '',
        department: response.data.department || '',
        bio: response.data.bio || '',
        permissions: response.data.permissions || [],
        notificationPreferences: response.data.notificationPreferences || {
          emailNotifications: true,
          systemAlerts: true,
          weeklyReports: true
        }
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      setMessage('')

      const response = await axios.put('/api/auth/profile', data)
      setProfile(response.data.user)
      setMessage('Admin profile updated successfully!')
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <Shield className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-600">Manage your administrator account and system preferences</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('success') 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Administrator Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., System Administrator, IT Manager"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department/Division
                </label>
                <input
                  type="text"
                  {...register('department')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Information Technology, Administration"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio/Description
              </label>
              <textarea
                rows={3}
                {...register('bio')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description about your role and responsibilities..."
              />
            </div>
          </div>

          {/* Admin Permissions */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Administrator Permissions
            </h3>
            <div className="text-red-800">
              <p className="mb-4">
                As a system administrator, you have full access to all platform features:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">User Management</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>View and manage all user accounts</li>
                    <li>Activate/deactivate user accounts</li>
                    <li>Reset user passwords</li>
                    <li>Assign user roles and permissions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">System Management</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Monitor system performance</li>
                    <li>View application analytics</li>
                    <li>Manage job postings and applications</li>
                    <li>Generate system reports</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('notificationPreferences.emailNotifications')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Email notifications for system events
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('notificationPreferences.systemAlerts')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  System alerts and security notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('notificationPreferences.weeklyReports')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Weekly system reports and analytics
                </label>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              System Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-blue-800">
              <div>
                <h4 className="font-semibold mb-2">Account Details</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Role:</strong> System Administrator</p>
                  <p><strong>Account Created:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
                  <p><strong>Last Login:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Account Status:</strong> <span className="text-green-600 font-medium">Active</span></p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    type="button"
                    className="block w-full text-left px-3 py-2 bg-white border border-blue-300 rounded text-sm hover:bg-blue-50"
                    onClick={() => window.location.href = '/admin/users'}
                  >
                    Manage Users
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-3 py-2 bg-white border border-blue-300 rounded text-sm hover:bg-blue-50"
                    onClick={() => window.location.href = '/admin/applications'}
                  >
                    View Applications
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-3 py-2 bg-white border border-blue-300 rounded text-sm hover:bg-blue-50"
                    onClick={() => window.location.href = '/settings'}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Complete Message - Only show when complete */}
          {profile?.name && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-6">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Profile Complete ✓</h3>
                  <p className="text-sm text-green-600">Your administrator profile is complete</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 font-medium"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving Profile...' : 'Save Admin Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProfile