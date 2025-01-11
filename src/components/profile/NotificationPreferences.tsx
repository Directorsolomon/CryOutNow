import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import api from '@/services/api'

interface NotificationSettings {
  emailNotifications: boolean;
  prayerReminders: boolean;
  chainTurnNotifications: boolean;
  dailyDigest: boolean;
}

export default function NotificationPreferences() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    prayerReminders: true,
    chainTurnNotifications: true,
    dailyDigest: false,
  })

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await api.put('/user/notification-preferences', settings)
      toast({
        title: 'Success',
        description: 'Your notification preferences have been updated.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update preferences',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="emailNotifications"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email Notifications
          </label>
          <p className="text-sm text-muted-foreground">
            Receive email notifications about your prayer requests and responses
          </p>
        </div>
        <Switch
          id="emailNotifications"
          checked={settings.emailNotifications}
          onCheckedChange={() => handleToggle('emailNotifications')}
        />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="prayerReminders"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Prayer Reminders
          </label>
          <p className="text-sm text-muted-foreground">
            Get reminded to pray for others' requests
          </p>
        </div>
        <Switch
          id="prayerReminders"
          checked={settings.prayerReminders}
          onCheckedChange={() => handleToggle('prayerReminders')}
        />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="chainTurnNotifications"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Prayer Chain Turn Notifications
          </label>
          <p className="text-sm text-muted-foreground">
            Get notified when it's your turn in a prayer chain
          </p>
        </div>
        <Switch
          id="chainTurnNotifications"
          checked={settings.chainTurnNotifications}
          onCheckedChange={() => handleToggle('chainTurnNotifications')}
        />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="dailyDigest"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Daily Digest
          </label>
          <p className="text-sm text-muted-foreground">
            Receive a daily summary of prayer activity
          </p>
        </div>
        <Switch
          id="dailyDigest"
          checked={settings.dailyDigest}
          onCheckedChange={() => handleToggle('dailyDigest')}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  )
} 