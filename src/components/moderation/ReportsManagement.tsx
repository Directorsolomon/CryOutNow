import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import {
  fetchReports,
  updateReportStatus,
  Report,
} from '@/store/slices/moderationSlice'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

const TARGET_TYPE_LABELS = {
  'user': 'User',
  'prayer-request': 'Prayer Request',
  'comment': 'Comment',
  'prayer-chain': 'Prayer Chain',
  'message': 'Message',
} as const

const STATUS_COLORS = {
  pending: 'default',
  resolved: 'success',
  dismissed: 'destructive',
} as const

interface ReportCardProps {
  report: Report;
  onUpdateStatus: (status: Report['status']) => void;
}

function ReportCard({ report, onUpdateStatus }: ReportCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">
                Report by {report.reporterName}
              </h4>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Badge variant={STATUS_COLORS[report.status]}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="outline">
                {TARGET_TYPE_LABELS[report.targetType]}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Reason:</span>
              <span className="text-sm">{report.reason}</span>
            </div>
          </div>

          <p className="text-sm">
            {report.description}
          </p>

          {report.status === 'pending' && (
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus('dismissed')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => onUpdateStatus('resolved')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Resolve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReportsManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { reports, loading } = useSelector(
    (state: RootState) => state.moderation
  )

  useEffect(() => {
    dispatch(fetchReports())
  }, [dispatch])

  const handleUpdateStatus = async (reportId: string, status: Report['status']) => {
    try {
      await dispatch(updateReportStatus({ reportId, status })).unwrap()
      toast({
        title: 'Success',
        description: `Report ${status === 'resolved' ? 'resolved' : 'dismissed'} successfully.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update report status',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reports Management</CardTitle>
          <CardDescription>
            No reports have been submitted yet.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const pendingReports = reports.filter(r => r.status === 'pending')
  const resolvedReports = reports.filter(r => r.status === 'resolved')
  const dismissedReports = reports.filter(r => r.status === 'dismissed')

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Reports Management</h2>
      </div>

      <div className="grid gap-6">
        {pendingReports.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Pending Reports ({pendingReports.length})
            </h3>
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onUpdateStatus={(status) => handleUpdateStatus(report.id, status)}
                />
              ))}
            </div>
          </div>
        )}

        {resolvedReports.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Resolved Reports ({resolvedReports.length})
            </h3>
            <div className="space-y-4">
              {resolvedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onUpdateStatus={(status) => handleUpdateStatus(report.id, status)}
                />
              ))}
            </div>
          </div>
        )}

        {dismissedReports.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Dismissed Reports ({dismissedReports.length})
            </h3>
            <div className="space-y-4">
              {dismissedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onUpdateStatus={(status) => handleUpdateStatus(report.id, status)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
