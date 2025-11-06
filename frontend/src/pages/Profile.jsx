import { useAuth } from '../contexts/AuthContext'
import StudentProfile from '../components/profiles/StudentProfile'
import CompanyProfile from '../components/profiles/CompanyProfile'
import FacultyProfile from '../components/profiles/FacultyProfile'
import AdminProfile from '../components/profiles/AdminProfile'
import { User } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const renderProfile = () => {
    switch (user.role) {
      case 'student':
        return <StudentProfile />
      case 'company':
        return <CompanyProfile />
      case 'faculty':
        return <FacultyProfile />
      case 'admin':
        return <AdminProfile />
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid User Role</h2>
              <p className="text-gray-600">
                Your account has an invalid role. Please contact support for assistance.
              </p>
            </div>
          </div>
        )
    }
  }

  return renderProfile()
}

export default Profile