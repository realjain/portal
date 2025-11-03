import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

const VerificationStatus = ({ user, className = '' }) => {
  if (user?.role !== 'student') {
    return null
  }

  const getStatusConfig = () => {
    switch (user.verificationStatus) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Verified Student',
          message: 'You are verified by faculty and can apply for jobs!',
          canApply: true
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Verification Rejected',
          message: 'Your verification was rejected. Please contact faculty for more information.',
          canApply: false
        }
      case 'pending':
      default:
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Verification Pending',
          message: 'Your account is pending faculty verification. You cannot apply for jobs until verified.',
          canApply: false
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${config.color} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${config.color} mb-1`}>{config.title}</h3>
          <p className="text-sm text-gray-700 mb-2">{config.message}</p>
          
          {user.verificationNotes && (
            <div className="mt-2 p-2 bg-white rounded border">
              <p className="text-xs font-medium text-gray-600 mb-1">Faculty Notes:</p>
              <p className="text-sm text-gray-700">{user.verificationNotes}</p>
            </div>
          )}
          
          {user.verificationDate && (
            <p className="text-xs text-gray-500 mt-2">
              {user.verificationStatus === 'approved' ? 'Verified' : 'Updated'} on{' '}
              {new Date(user.verificationDate).toLocaleDateString()}
              {user.verifiedBy && (
                <span> by {user.verifiedBy.name}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerificationStatus