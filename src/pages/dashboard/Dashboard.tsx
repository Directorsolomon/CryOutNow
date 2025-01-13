import { useSelector } from 'react-redux'
import { RootState } from '@/store'

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.displayName}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here's an overview of your prayer activity
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Prayer Requests Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Prayer Requests</h2>
          <p className="mt-1 text-3xl font-semibold text-indigo-600">0</p>
          <p className="mt-1 text-sm text-gray-500">Active requests</p>
        </div>

        {/* Prayer Chains Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Prayer Chains</h2>
          <p className="mt-1 text-3xl font-semibold text-indigo-600">0</p>
          <p className="mt-1 text-sm text-gray-500">Chains joined</p>
        </div>

        {/* Prayers Offered Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Prayers Offered</h2>
          <p className="mt-1 text-3xl font-semibold text-indigo-600">0</p>
          <p className="mt-1 text-sm text-gray-500">Total prayers</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-gray-500 text-center py-4">
            No recent activity to show
          </div>
        </div>
      </div>
    </div>
  )
} 
