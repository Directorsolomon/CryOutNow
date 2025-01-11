import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
} from 'recharts'
import { CommunityMetrics } from '@/store/slices/analyticsSlice'

interface CommunityMetricsChartsProps {
  metrics: CommunityMetrics;
  historicalData: Array<{
    date: string;
    connections: number;
    messages: number;
    groupSessions: number;
    partnerMatches: number;
  }>;
}

export default function CommunityMetricsCharts({ 
  metrics, 
  historicalData 
}: CommunityMetricsChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Community Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="connections"
                  name="Connections"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  name="Messages"
                  stroke="#00C49F"
                  fill="#00C49F"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="groupSessions"
                  name="Group Sessions"
                  fill="#FFBB28"
                />
                <Line
                  type="monotone"
                  dataKey="partnerMatches"
                  name="Partner Matches"
                  stroke="#FF8042"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 