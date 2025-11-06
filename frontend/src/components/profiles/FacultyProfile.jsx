import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Save, GraduationCap, User, Award, BookOpen, Mail, Phone } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const FacultyProfile = () => {
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
        department: response.data.department || '',
        designation: response.data.designation || '',
        qualification: response.data.qualification || '',
        experience: response.data.experience || '',
        specialization: response.data.specialization || '',
        phone: response.data.phone || '',
        officeLocation: response.data.officeLocation || '',
        officeHours: response.data.officeHours || '',
        bio: response.data.bio || '',
        researchInterests: response.data.researchInterests || '',
        publications: response.data.publications || ''
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
        experience: data.experience ? parseInt(data.experience) : undefined
      }

      const response = await axios.put('/api/auth/profile', formattedData)
      setProfile(response.data.user)
      setMessage('Faculty profile updated successfully!')
      
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
          <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Profile</h1>
            <p className="text-gray-600">Manage your academic profile and student verification settings</p>
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
                  placeholder="Dr. John Smith"
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
                  Department *
                </label>
                <select
                  {...register('department', { required: 'Department is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics & Communication</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Electrical">Electrical Engineering</option>
                  <option value="Chemical">Chemical Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Management">Management Studies</option>
                  <option value="Other">Other</option>
                </select>
                {errors.department && (
                  <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <select
                  {...register('designation')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Designation</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Senior Lecturer">Senior Lecturer</option>
                  <option value="Head of Department">Head of Department</option>
                  <option value="Dean">Dean</option>
                  <option value="Other">Other</option>
                </select>
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
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  {...register('experience')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Academic Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Qualification
                </label>
                <input
                  type="text"
                  {...register('qualification')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Ph.D. in Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization/Research Areas
                </label>
                <textarea
                  rows={3}
                  {...register('specialization')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Machine Learning, Data Science, Artificial Intelligence..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Interests
                </label>
                <textarea
                  rows={3}
                  {...register('researchInterests')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your current research interests and ongoing projects..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notable Publications
                </label>
                <textarea
                  rows={4}
                  {...register('publications')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List your key publications, research papers, or academic achievements..."
                />
              </div>
            </div>
          </div>

          {/* Office Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Office Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Location
                </label>
                <input
                  type="text"
                  {...register('officeLocation')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Room 301, CS Building"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Hours
                </label>
                <input
                  type="text"
                  {...register('officeHours')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mon-Fri 10:00 AM - 4:00 PM"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio/About
              </label>
              <textarea
                rows={4}
                {...register('bio')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write a brief bio about yourself, your teaching philosophy, and academic background..."
              />
            </div>
          </div>

          {/* Student Verification Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Student Verification Role
            </h3>
            <div className="text-blue-800">
              <p className="mb-2">
                As a faculty member, you have the responsibility to verify student profiles before they can apply for jobs and internships.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Review student academic profiles and resumes</li>
                <li>Verify student eligibility for job applications</li>
                <li>Provide feedback and guidance to students</li>
                <li>Approve or reject student verification requests</li>
              </ul>
              <p className="mt-3 text-sm">
                Access your verification dashboard from the main navigation to manage student verifications.
              </p>
            </div>
          </div>

          {/* Profile Complete Message - Only show when complete */}
          {profile?.name && profile?.department && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-6">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Profile Complete ✓</h3>
                  <p className="text-sm text-green-600">Your faculty profile is complete and ready</p>
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
              {saving ? 'Saving Profile...' : 'Save Faculty Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FacultyProfile