import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LogOut, 
  User, 
  Briefcase, 
  FileText, 
  Settings,
  ChevronDown,
  Home,
  BarChart3,
  Users,
  Building2
} from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
  }

  const getRoleColor = (role) => {
    const colors = {
      student: 'bg-blue-500',
      faculty: 'bg-indigo-500',
      company: 'bg-green-500',
      admin: 'bg-purple-500'
    }
    return colors[role] || 'bg-gray-500'
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎓</span>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">College Portal</div>
              <div className="text-xs text-gray-500">Career & Placement Center</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
            
            <Link 
              to="/jobs" 
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                
                {user.role === 'student' && (
                  <>
                    <Link 
                      to="/profile" 
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link 
                      to="/applications" 
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Applications
                    </Link>
                  </>
                )}

                {user.role === 'company' && (
                  <Link 
                    to="/company/jobs" 
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    My Jobs
                  </Link>
                )}

                {user.role === 'faculty' && (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Verify Students
                  </Link>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin/users" 
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Users
                    </Link>
                    <Link 
                      to="/admin/applications" 
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Applications
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 transition-colors duration-200"
                  >
                    <div className={`w-8 h-8 ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                      {getUserInitials(user.name)}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400 capitalize mt-1">
                          <span className={`inline-block w-2 h-2 ${getRoleColor(user.role)} rounded-full mr-2`}></span>
                          {user.role} Account
                        </div>
                      </div>
                      
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            handleLogout()
                            setShowUserMenu(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {user ? (
              <div className={`w-8 h-8 ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                {getUserInitials(user.name)}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar