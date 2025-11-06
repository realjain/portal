import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  ArrowRight, 
  Users, 
  Building2, 
  TrendingUp, 
  Star,
  CheckCircle,
  Briefcase,
  Award,
  Target,
  Zap,
  Shield,
  Globe,
  PlayCircle,
  ChevronRight
} from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Registered Students', value: '2,500+', icon: Users, color: 'blue' },
    { label: 'Recruiting Companies', value: '150+', icon: Building2, color: 'green' },
    { label: 'Successful Placements', value: '1,200+', icon: TrendingUp, color: 'purple' },
    { label: 'Placement Rate', value: '94%', icon: Award, color: 'orange' }
  ]

  const features = [
    {
      icon: Target,
      title: 'Smart Job Matching',
      description: 'AI-powered algorithm matches you with the perfect opportunities based on your skills and preferences.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications about application status changes and new job postings.'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security and privacy measures.'
    },
    {
      icon: Globe,
      title: 'Global Opportunities',
      description: 'Access internships and jobs from companies worldwide, including remote positions.'
    }
  ]





  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative text-center py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2" />
              #1 Placement Portal for Students & Companies
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
              College Career &
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Placement Portal
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed">
              Empowering students with career opportunities. Connect with top companies, 
              find internships, secure placements, and build your professional future.
            </p>
            
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Briefcase className="mr-2 w-5 h-5" />
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/jobs"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 backdrop-blur-sm inline-flex items-center"
                >
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-8"
              >
                <Target className="mr-2 w-5 h-5" />
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            )}


          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-green-400 rounded-full opacity-20 animate-ping"></div>
      </section>



      {/* Stats Section */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-gray-600">Join our growing community of successful professionals</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const colorClasses = {
                blue: 'bg-blue-500 text-blue-600 bg-blue-50',
                green: 'bg-green-500 text-green-600 bg-green-50',
                purple: 'bg-purple-500 text-purple-600 bg-purple-50',
                orange: 'bg-orange-500 text-orange-600 bg-orange-50'
              }
              
              return (
                <div key={index} className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className={`w-16 h-16 ${colorClasses[stat.color].split(' ')[2]} rounded-2xl mx-auto mb-6 flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 ${colorClasses[stat.color].split(' ')[1]}`} />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide cutting-edge tools and features to make your career journey smooth and successful
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-6 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Users className="w-4 h-4 mr-2" />
              For Students
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Launch Your Career from College
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Access exclusive campus opportunities, build your professional profile, and get placed in top companies through our college placement cell.
            </p>
            
            <div className="space-y-6">
              {[
                { title: 'Smart Job Discovery', desc: 'AI-powered recommendations based on your skills and interests' },
                { title: 'Application Tracking', desc: 'Monitor your progress with real-time status updates' },
                { title: 'Profile Builder', desc: 'Create a compelling profile that stands out to employers' },
                { title: 'Career Guidance', desc: 'Get expert advice and tips for interview success' }
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {!user && (
              <div className="mt-8">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 inline-flex items-center"
                >
                  Join as Student
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
              <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Student Dashboard</h3>
                    <p className="text-blue-100 text-sm">Your career command center</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Applications</span>
                      <span className="font-bold">12</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Interviews</span>
                      <span className="font-bold">3</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Offers</span>
                      <span className="font-bold text-yellow-300">1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="px-4 bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl p-8 text-white">
              <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-4">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Company Dashboard</h3>
                    <p className="text-green-100 text-sm">Hire the best talent</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Jobs</span>
                      <span className="font-bold">8</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Applications</span>
                      <span className="font-bold">156</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hired</span>
                      <span className="font-bold text-yellow-300">23</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Building2 className="w-4 h-4 mr-2" />
              For Companies
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Find Top Talent Effortlessly
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Post jobs, review applications, and hire the best candidates with our comprehensive recruitment platform.
            </p>
            
            <div className="space-y-6">
              {[
                { title: 'Easy Job Posting', desc: 'Create attractive job listings in minutes with our intuitive form' },
                { title: 'Smart Filtering', desc: 'Find qualified candidates with advanced search and filtering' },
                { title: 'Application Management', desc: 'Streamlined workflow to review and manage applications' },
                { title: 'Analytics & Insights', desc: 'Track hiring metrics and optimize your recruitment process' }
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {!user && (
              <div className="mt-8">
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 inline-flex items-center"
                >
                  Join as Company
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of students and companies who have found success through our platform.
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Users className="mr-2 w-5 h-5" />
                  Join as Student
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center"
                >
                  <Building2 className="mr-2 w-5 h-5" />
                  Join as Company
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Target className="mr-2 w-5 h-5" />
                Continue Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            )}
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
        </div>
      </section>
    </div>
  )
}

export default Home