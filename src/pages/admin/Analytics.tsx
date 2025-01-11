import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export default function Analytics() {
  const { user } = useSelector((state: RootState) => state.auth)
  const isAdmin = user?.roles?.includes('admin')

  if (!isAdmin) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
          Only administrators can access the analytics dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <AnalyticsDashboard />
    </div>
  )
} 