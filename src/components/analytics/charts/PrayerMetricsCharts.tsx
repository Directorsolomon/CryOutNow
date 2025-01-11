import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { PrayerChainMetrics, PrayerRequestMetrics } from '@/store/slices/analyticsSlice'

interface PrayerMetricsChartsProps {
  chainMetrics: PrayerChainMetrics;
  requestMetrics: PrayerRequestMetrics;
  historicalData: Array<{
    date: string;
    activeChains: number;
    completedChains: number;
    newRequests: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function PrayerMetricsCharts({ 
  chainMetrics, 
  requestMetrics, 
  historicalData 
}: PrayerMetricsChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Prayer Chain Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="activeChains" 
                  name="Active Chains" 
                  fill="#0088FE" 
                />
                <Bar 
                  dataKey="completedChains" 
                  name="Completed Chains" 
                  fill="#00C49F" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Prayer Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestMetrics.topPrayerTopics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="topic"
                  label={({ topic, count, percent }) => 
                    `${topic} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {requestMetrics.topPrayerTopics.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 