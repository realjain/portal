import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Plus, Trash2, Save, User, Award, GraduationCap } from 'lucide-react'
import ResumeUpload from '../ResumeUpload'

const StudentProfile = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm()
  
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills'
  })

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  })

  // Watch form values for real-time completion status
  const watchedValues = watch()
  
  // Calculate real-time completion status
  const calculateCompletionStatus = () => {
    const program = watchedValues?.program?.trim()
    const graduationYear = watchedValues?.graduationYear
    const skills = watchedValues?.skills?.filter(skill => skill?.value?.trim()).length > 0
    const hasResume = profile?.resumeUrl || false
    
    const requiredFields = [
      { name: 'Program', completed: !!program },
      { name: 'Graduation Year', completed: !!graduationYear },
      { name: 'Skills', completed: skills },
      { name: 'Resume', completed: hasResume }
    ]
    
    const completedCount = requiredFields.filter(field => field.completed).length
    const totalRequired = requiredFields.length
    const isComplete = completedCount === totalRequired
    const percentage = Math.round((completedCount / totalRequired) * 100)
    
    return {
      isComplete,
      percentage,
      completedCount,
      totalRequired,
      requiredFields,
      missingFields: requiredFields.filter(field => !field.completed)
    }
  }

  const completionStatus = calculateCompletionStatus()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profiles/me')
      setProfile(response.data)
      
      // Reset form with profile data
      reset({
        ...response.data,
        skills: response.data.skills?.map(skill => ({ value: skill })) || [],
        projects: response.data.projects || []
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (error.response?.status === 404) {
        // Profile doesn't exist, create empty form
        reset({
          program: '',
          graduationYear: new Date().getFullYear() + 4,
          cgpa: '',
          skills: [],
          projects: [],
          resumeUrl: '',
          linkedinUrl: '',
          githubUrl: '',
          portfolioUrl: ''
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      setMessage('')

      // Transform skills array
      const formattedData = {
        ...data,
        skills: data.skills?.map(skill => skill.value).filter(Boolean) || [],
        cgpa: data.cgpa ? parseFloat(data.cgpa) : undefined,
        graduationYear: parseInt(data.graduationYear)
      }

      // Check if profile is complete
      const isComplete = !!(
        formattedData.program &&
        formattedData.graduationYear &&
        formattedData.skills?.length > 0 &&
        formattedData.resumeUrl
      )
      
      formattedData.isProfileComplete = isComplete

      const response = await axios.put('/api/profiles/me', formattedData)
      setProfile(response.data.profile)
      setMessage('Profile updated successfully!')
      
      // If profile is now complete and there's a return URL, redirect after a short delay
      if (isComplete && returnTo) {
        setTimeout(() => {
          navigate(returnTo)
        }, 2000)
      } else {
        setTimeout(() => setMessage(''), 3000)
      }
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
            <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-gray-600">Complete your academic and professional information</p>
          </div>
        </div>

        {returnTo && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              <strong>Complete your profile to apply for jobs!</strong> Fill in the required fields below and we'll take you back to the job application.
            </p>
          </div>
        )}

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
          {/* Academic Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Academic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program *
                </label>
                <input
                  type="text"
                  {...register('program', { required: 'Program is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., B.Tech Computer Science"
                />
                {errors.program && (
                  <p className="text-red-500 text-sm mt-1">{errors.program.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year *
                </label>
                <input
                  type="number"
                  {...register('graduationYear', { 
                    required: 'Graduation year is required',
                    min: { value: 2020, message: 'Invalid year' },
                    max: { value: 2030, message: 'Invalid year' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.graduationYear && (
                  <p className="text-red-500 text-sm mt-1">{errors.graduationYear.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  {...register('cgpa')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8.5"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Technical Skills *</h3>
              <button
                type="button"
                onClick={() => appendSkill({ value: '' })}
                className="flex items-center text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded border"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-2">
              {skillFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    {...register(`skills.${index}.value`)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., JavaScript, Python, React"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {skillFields.length === 0 && (
              <p className="text-gray-500 text-sm">Add your technical skills to help match with relevant jobs</p>
            )}
          </div>

          {/* Projects */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
              <button
                type="button"
                onClick={() => appendProject({ 
                  title: '', 
                  description: '', 
                  technologies: [], 
                  url: '' 
                })}
                className="flex items-center text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded border"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Project
              </button>
            </div>

            <div className="space-y-6">
              {projectFields.map((field, index) => (
                <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Project {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        {...register(`projects.${index}.title`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., E-commerce Website"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project URL
                      </label>
                      <input
                        type="url"
                        {...register(`projects.${index}.url`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      {...register(`projects.${index}.description`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your project, technologies used, and key features..."
                    />
                  </div>
                </div>
              ))}
            </div>
            {projectFields.length === 0 && (
              <p className="text-gray-500 text-sm">Add your projects to showcase your practical experience</p>
            )}
          </div>

          {/* Resume Upload */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume *</h3>
            <ResumeUpload />
          </div>

          {/* Professional Links */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  {...register('linkedinUrl')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  {...register('githubUrl')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/your-username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  {...register('portfolioUrl')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-portfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Profile Complete Message - Only show when complete */}
          {completionStatus.isComplete && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-6">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Profile Complete ✓</h3>
                  <p className="text-sm text-green-600">You can now apply for jobs and internships</p>
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
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentProfile