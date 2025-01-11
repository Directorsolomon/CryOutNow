import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import api from '@/services/api'

interface PrayerActivity {
  id: string;
  type: 'PRAYER_CHAIN' | 'PRAYER_REQUEST';
  title: string;
  description: string;
  timestamp: string;
}

interface Stats {
  totalPrayers: number;
  activeChains: number;
  completedChains: number;
  prayerRequests: number;
  answeredPrayers: number;
}

export default function PrayerStats() {
  const [stats, setStats] = useState<Stats>({
    totalPrayers: 0,
    activeChains: 0,
    completedChains: 0,
    prayerRequests: 0,
    answeredPrayers: 0,
  })
  const [recentActivity, setRecentActivity] = useState<PrayerActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          api.get('/user/prayer-stats'),
          api.get('/user/prayer-activity'),
        ])
        setStats(statsResponse.data)
        setRecentActivity(activityResponse.data)
      } catch (error) {
        console.error('Failed to fetch prayer statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrayers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChains}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Chains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedChains}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prayer Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prayerRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answered Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.answeredPrayers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent prayer activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.type === 'PRAYER_CHAIN' ? 'Prayer Chain' : 'Prayer Request'}
                  </TableCell>
                  <TableCell>{activity.title}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {activity.description}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 