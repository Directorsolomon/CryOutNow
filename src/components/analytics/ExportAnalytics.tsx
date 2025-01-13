import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { exportAnalytics } from '@/utils/exportAnalytics'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ExportAnalytics() {
  const [format, setFormat] = useState<'csv' | 'json'>('csv')
  const [section, setSection] = useState<'users' | 'prayer' | 'community' | 'all'>('all')
  const { toast } = useToast()
  
  const metrics = useSelector((state: RootState) => ({
    userMetrics: state.analytics.userMetrics,
    prayerChainMetrics: state.analytics.prayerChainMetrics,
    prayerRequestMetrics: state.analytics.prayerRequestMetrics,
    communityMetrics: state.analytics.communityMetrics,
    historicalData: state.analytics.historicalData,
  }))

  const handleExport = () => {
    try {
      exportAnalytics(
        metrics,
        format,
        section === 'all' ? undefined : section
      )
      toast({
        title: 'Export Successful',
        description: 'Your analytics data has been exported successfully.',
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your analytics data.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Analytics Data</DialogTitle>
          <DialogDescription>
            Choose your export preferences below
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="format">Export Format</label>
            <Select
              value={format}
              onValueChange={(value: 'csv' | 'json') => setFormat(value)}
            >
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
            <label htmlFor="section">Data Section</label>
            <Select
              value={section}
              onValueChange={(value: 'users' | 'prayer' | 'community' | 'all') => 
                setSection(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="users">User Metrics</SelectItem>
                <SelectItem value="prayer">Prayer Metrics</SelectItem>
                <SelectItem value="community">Community Metrics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
