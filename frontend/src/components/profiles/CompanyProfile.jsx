import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Save, Building2, MapPin, Users, Globe, Phone, Mail } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const CompanyProfile = () => {
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
        companyName: response.data.companyName || '',
        description: response.data.description || '',
        industry: response.data.industry || '',
        website: response.data.website || '',
        location: response.data.location || '',
        size: response.data.size || '',
        founded: response.data.founded || '',
        contactEmail: response.data.contactEmail || response.data.email,
        contactPhone: response.data.contactPhone || '',
        address: response.data.address || '',
        benefits: response.data.benefits || '',
        culture: response.data.culture || ''
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

      const formattedData = {
        ...data,
        founded: data.founded ? parseInt(data.founded) : undefined
      }

      const response = await axios.put('/api/auth/profile', formattedData)
      setProfile(response.data.user)
      setMessage('Company profile updated successfully!')
      
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
          <Building2 className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600">Manage your company information and attract top talent</p>
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
          {/* Basic Company Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  {...register('companyName', { required: 'Company name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tech Solutions Inc."
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  {...register('industry', { required: 'Industry is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Media">Media & Entertainment</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Other">Other</option>
                </select>
                {errors.industry && (
                  <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  {...register('size')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founded Year
                </label>
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  {...register('founded')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2010"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description *
              </label>
              <textarea
                rows={4}
                {...register('description', { required: 'Company description is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your company, mission, and what makes it unique..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  {...register('website')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  {...register('contactEmail')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="hr@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  {...register('contactPhone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <textarea
                rows={3}
                {...register('address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Complete office address..."
              />
            </div>
          </div>

          {/* Company Culture & Benefits */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Culture & Benefits
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Culture
                </label>
                <textarea
                  rows={4}
                  {...register('culture')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your company culture, values, and work environment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Benefits
                </label>
                <textarea
                  rows={4}
                  {...register('benefits')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List employee benefits like health insurance, flexible hours, remote work, etc..."
                />
              </div>
            </div>
          </div>

          {/* Profile Complete Message - Only show when complete */}
          {profile?.companyName && profile?.description && profile?.industry && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-6">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Profile Complete ✓</h3>
                  <p className="text-sm text-green-600">Your company profile is ready to attract candidates</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving Profile...' : 'Save Company Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanyProfile