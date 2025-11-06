import { useAuth } from '../contexts/AuthContext'
import StudentDashboard from '../components/dashboards/StudentDashboard'
import CompanyDashboard from '../components/dashboards/CompanyDashboard'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import FacultyDashboard from '../components/dashboards/FacultyDashboard'

const Dashboard = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  if (!user) {
    return <div>No user data available</div>
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />
      case 'faculty':
        return <FacultyDashboard />
      case 'company':
        return <CompanyDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold">Invalid User Role</h3>
            <p className="text-red-600">Role: {user?.role || 'undefined'}</p>
            <p className="text-sm text-red-500 mt-2">Please contact support if this issue persists.</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard
        </p>
      </div>
      
      {renderDashboard()}
    </div>
  )
}

export default Dashboard