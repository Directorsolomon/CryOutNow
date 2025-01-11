import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import EditProfileForm from '@/components/profile/EditProfileForm'
import ChangePasswordForm from '@/components/profile/ChangePasswordForm'
import NotificationPreferences from '@/components/profile/NotificationPreferences'
import PrayerStats from '@/components/profile/PrayerStats'

export default function Profile() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and email address
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <EditProfileForm />
            ) : (
              <div className="space-y-2">
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-muted-foreground">{user?.displayName}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                {user?.bio && (
                  <div>
                    <p className="font-medium">Bio</p>
                    <p className="text-muted-foreground">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage your password and account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <PrayerStats />
      </div>

      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <ChangePasswordForm onClose={() => setIsChangingPassword(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
} 