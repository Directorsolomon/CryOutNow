import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import {
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule,
  sendTestReport,
} from '@/store/slices/reportingSlice'
import { CreateReportScheduleDto, ReportSchedule } from '@/services/reportingService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Send, Trash } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

function ScheduleForm({ 
  onSubmit, 
  initialData,
  onCancel,
}: { 
  onSubmit: (data: CreateReportScheduleDto) => void;
  initialData?: ReportSchedule;
  onCancel: () => void;
}) {
  const [frequency, setFrequency] = useState(initialData?.frequency || 'weekly')
  const [format, setFormat] = useState(initialData?.format || 'csv')
  const [sections, setSections] = useState<string[]>(initialData?.sections || ['users'])
  const [recipients, setRecipients] = useState(initialData?.recipients.join(', ') || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      frequency: frequency as 'daily' | 'weekly' | 'monthly',
      format: format as 'csv' | 'json',
      sections: sections as ('users' | 'prayer' | 'community')[],
      recipients: recipients.split(',').map(email => email.trim()),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label>Frequency</label>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <label>Format</label>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <label>Sections</label>
        <Select
          value={sections.join(',')}
          onValueChange={(value) => setSections(value.split(','))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="users">User Metrics</SelectItem>
            <SelectItem value="prayer">Prayer Metrics</SelectItem>
            <SelectItem value="community">Community Metrics</SelectItem>
            <SelectItem value="users,prayer,community">All Sections</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <label>Recipients (comma-separated emails)</label>
        <Input
          type="text"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="email1@example.com, email2@example.com"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Schedule' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  )
}

export default function ReportSchedules() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const { schedules, loading } = useSelector((state: RootState) => state.reporting)
  const { toast } = useToast()

  useEffect(() => {
    dispatch(fetchSchedules())
  }, [dispatch])

  const handleCreateSchedule = async (data: CreateReportScheduleDto) => {
    try {
      await dispatch(createSchedule(data)).unwrap()
      setIsDialogOpen(false)
      toast({
        title: 'Schedule Created',
        description: 'The report schedule has been created successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create report schedule.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateSchedule = async (data: CreateReportScheduleDto) => {
    if (!editingSchedule) return
    try {
      await dispatch(updateSchedule({
        id: editingSchedule.id,
        updates: data,
      })).unwrap()
      setIsDialogOpen(false)
      setEditingSchedule(null)
      toast({
        title: 'Schedule Updated',
        description: 'The report schedule has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update report schedule.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    try {
      await dispatch(deleteSchedule(id)).unwrap()
      toast({
        title: 'Schedule Deleted',
        description: 'The report schedule has been deleted successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete report schedule.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleSchedule = async (id: string, enabled: boolean) => {
    try {
      await dispatch(toggleSchedule({ id, enabled })).unwrap()
      toast({
        title: enabled ? 'Schedule Enabled' : 'Schedule Disabled',
        description: `The report schedule has been ${enabled ? 'enabled' : 'disabled'} successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule status.',
        variant: 'destructive',
      })
    }
  }

  const handleSendTestReport = async (schedule: ReportSchedule) => {
    try {
      await dispatch(sendTestReport({
        frequency: schedule.frequency,
        format: schedule.format,
        sections: schedule.sections,
        recipients: schedule.recipients,
      })).unwrap()
      toast({
        title: 'Test Report Sent',
        description: 'A test report has been sent to the specified recipients.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test report.',
        variant: 'destructive',
      })
    }
  }

  if (loading && !schedules.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Automated Reports</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
              </DialogTitle>
              <DialogDescription>
                Set up automated report delivery to specified email addresses.
              </DialogDescription>
            </DialogHeader>
            <ScheduleForm
              onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
              initialData={editingSchedule || undefined}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingSchedule(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} Report
              </CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={schedule.enabled}
                  onCheckedChange={(checked) => handleToggleSchedule(schedule.id, checked)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendTestReport(schedule)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSchedule(schedule)
                    setIsDialogOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSchedule(schedule.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Format: {schedule.format.toUpperCase()}</p>
                <p>Sections: {schedule.sections.join(', ')}</p>
                <p>Recipients: {schedule.recipients.join(', ')}</p>
                {schedule.lastSent && (
                  <p>Last sent: {new Date(schedule.lastSent).toLocaleString()}</p>
                )}
                {schedule.nextScheduled && (
                  <p>Next scheduled: {new Date(schedule.nextScheduled).toLocaleString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 