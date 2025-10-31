import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Briefcase, Users, Award, TrendingUp } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
        <h1 className="text-5xl font-bold mb-6">
          Internship & Placement Portal
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Connect students with opportunities, streamline recruitment, and build successful careers
        </p>
        {!user && (
          <div className="space-y-4">
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </Link>
              <Link
                to="/jobs"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Browse Jobs
              </Link>
            </div>
            <div className="text-sm">
              <span className="text-blue-100">Quick Login: </span>
              <Link to="/login" className="text-white underline hover:text-blue-200 mx-2">
                Student
              </Link>
              <Link to="/login" className="text-white underline hover:text-blue-200 mx-2">
                Company
              </Link>
              <Link to="/login" className="text-white underline hover:text-blue-200 mx-2">
                Admin
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* User Types */}
      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-lg shadow-md border-t-4 border-green-500">
          <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">For Students</h3>
          <p className="text-gray-600 mb-4">
            Build your profile, apply for jobs, track applications, and showcase your skills
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1 mb-4">
            <li>• Create comprehensive profiles</li>
            <li>• Apply for internships & jobs</li>
            <li>• Track application status</li>
            <li>• Upload resume & portfolio</li>
          </ul>
          {!user && (
            <Link
              to="/login"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
            >
              Student Login
            </Link>
          )}
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-500">
          <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">For Companies</h3>
          <p className="text-gray-600 mb-4">
            Post job openings, review applications, and find the best talent
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1 mb-4">
            <li>• Post job opportunities</li>
            <li>• Review student applications</li>
            <li>• Manage recruitment process</li>
            <li>• Access talent database</li>
          </ul>
          {!user && (
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Company Login
            </Link>
          )}
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-md border-t-4 border-purple-500">
          <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">For Admins</h3>
          <p className="text-gray-600 mb-4">
            Manage the platform, oversee users, and monitor system analytics
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1 mb-4">
            <li>• Manage all users</li>
            <li>• System analytics</li>
            <li>• Monitor activities</li>
            <li>• Platform administration</li>
          </ul>
          {!user && (
            <Link
              to="/login"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition"
            >
              Admin Login
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <TrendingUp className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600">
            Track placement trends and recruitment analytics with detailed insights
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Award className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
          <p className="text-gray-600">
            Role-based access control ensures data security and user privacy
          </p>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="text-center py-16 bg-gray-100 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students and recruiters on our platform
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Account
          </Link>
        </section>
      )}
    </div>
  )
}

export default Home