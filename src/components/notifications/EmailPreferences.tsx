import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import {
  fetchEmailPreferences,
  updateEmailPreferences,
  resendVerificationEmail,
  enablePushNotifications,
  checkPushPermission,
} from '@/store/slices/notificationsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { AlertCircle, CheckCircle2, Loader2, Bell } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export default function EmailPreferences() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const {
    emailPreferences,
    emailVerified,
    loading,
    pushEnabled,
    pushSupported,
  } = useSelector((state: RootState) => state.notifications)

  useEffect(() => {
    dispatch(fetchEmailPreferences())
    dispatch(checkPushPermission())
  }, [dispatch])

  const handleToggle = async (key: keyof typeof emailPreferences) => {
    try {
      await dispatch(updateEmailPreferences({
        [key]: !emailPreferences[key],
      })).unwrap()
      toast({
        title: 'Preferences Updated',
        description: 'Your email notification preferences have been saved.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update preferences',
      })
    }
  }

  const handleResendVerification = async () => {
    try {
      await dispatch(resendVerificationEmail()).unwrap()
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox for the verification link.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send verification email',
      })
    }
  }

  const handleEnablePushNotifications = async () => {
    try {
      const enabled = await dispatch(enablePushNotifications()).unwrap()
      if (enabled) {
        toast({
          title: 'Push Notifications Enabled',
          description: 'You will now receive push notifications.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to enable push notifications',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you'd like to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!emailVerified && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Email Not Verified</AlertTitle>
            <AlertDescription className="mt-2">
              <p>Please verify your email address to receive notifications.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                className="mt-2"
              >
                Resend Verification Email
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {emailVerified && (
          <Alert variant="success" className="mb-6">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Email Verified</AlertTitle>
            <AlertDescription>
              Your email is verified and you can receive notifications.
            </AlertDescription>
          </Alert>
        )}

        {pushSupported && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications" className="flex flex-col">
                <span>Push Notifications</span>
                <span className="text-sm text-muted-foreground">
                  Receive instant notifications in your browser
                </span>
              </Label>
              <Switch
                id="pushNotifications"
                checked={pushEnabled}
                onCheckedChange={handleEnablePushNotifications}
              />
            </div>
            <Separator />
          </>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="prayerTurnReminders" className="flex flex-col">
              <span>Prayer Turn Reminders</span>
              <span className="text-sm text-muted-foreground">
                Get notified when it's your turn to pray in a prayer chain
              </span>
            </Label>
            <Switch
              id="prayerTurnReminders"
              checked={emailPreferences.prayerTurnReminders}
              onCheckedChange={() => handleToggle('prayerTurnReminders')}
              disabled={!emailVerified}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="prayerRequestUpdates" className="flex flex-col">
              <span>Prayer Request Updates</span>
              <span className="text-sm text-muted-foreground">
                Receive updates when someone prays for your requests
              </span>
            </Label>
            <Switch
              id="prayerRequestUpdates"
              checked={emailPreferences.prayerRequestUpdates}
              onCheckedChange={() => handleToggle('prayerRequestUpdates')}
              disabled={!emailVerified}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dailyDigest" className="flex flex-col">
              <span>Daily Digest</span>
              <span className="text-sm text-muted-foreground">
                Get a daily summary of prayer activity
              </span>
            </Label>
            <Switch
              id="dailyDigest"
              checked={emailPreferences.dailyDigest}
              onCheckedChange={() => handleToggle('dailyDigest')}
              disabled={!emailVerified}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="commentNotifications" className="flex flex-col">
              <span>Comment Notifications</span>
              <span className="text-sm text-muted-foreground">
                Get notified when someone comments on your prayer requests
              </span>
            </Label>
            <Switch
              id="commentNotifications"
              checked={emailPreferences.commentNotifications}
              onCheckedChange={() => handleToggle('commentNotifications')}
              disabled={!emailVerified}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="chainInvites" className="flex flex-col">
              <span>Chain Invites</span>
              <span className="text-sm text-muted-foreground">
                Receive notifications for prayer chain invitations
              </span>
            </Label>
            <Switch
              id="chainInvites"
              checked={emailPreferences.chainInvites}
              onCheckedChange={() => handleToggle('chainInvites')}
              disabled={!emailVerified}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 