import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchAnalytics, setTimeRange } from '@/store/slices/analyticsSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import UserMetricsCharts from './charts/UserMetricsCharts'
import PrayerMetricsCharts from './charts/PrayerMetricsCharts'
import CommunityMetricsCharts from './charts/CommunityMetricsCharts'
import ExportAnalytics from './ExportAnalytics'
import ReportSchedules from './ReportSchedules'

export default function AnalyticsDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    userMetrics, 
    prayerChainMetrics, 
    prayerRequestMetrics,
    communityMetrics,
    historicalData,
    timeRange,
    loading 
  } = useSelector((state: RootState) => state.analytics)

  useEffect(() => {
    dispatch(fetchAnalytics(timeRange))
  }, [dispatch, timeRange])

  const handleTimeRangeChange = (value: string) => {
    dispatch(setTimeRange(value))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <ExportAnalytics />
          <Select
            value={timeRange}
            onValueChange={handleTimeRangeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="reports">Automated Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid gap-8">
            <UserMetricsCharts metrics={userMetrics} historicalData={historicalData} />
            <PrayerMetricsCharts metrics={prayerMetrics} historicalData={historicalData} />
            <CommunityMetricsCharts metrics={communityMetrics} historicalData={historicalData} />
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <ReportSchedules />
        </TabsContent>
      </Tabs>
    </div>
  )
} 