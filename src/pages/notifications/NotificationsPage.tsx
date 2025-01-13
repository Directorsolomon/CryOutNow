import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  Notification,
} from '@/store/slices/notificationsSlice'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Bell,
  CheckCircle2,
  HandsPraying,
  Loader2,
  MessageCircle,
  Users,
} from 'lucide-react'
import EmailPreferences from '@/components/notifications/EmailPreferences'

const NOTIFICATION_ICONS = {
  prayer_turn: HandsPraying,
  prayer_request: HandsPraying,
  comment: MessageCircle,
  chain_invite: Users,
  prayer_answered: CheckCircle2,
}

function NotificationCard({ notification }: { notification: Notification }) {
  const Icon = NOTIFICATION_ICONS[notification.type]

  return (
    <Card className={notification.read ? 'bg-background' : 'bg-muted/20'}>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-medium">{notification.title}</h4>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NotificationsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { items, unreadCount, loading } = useSelector((state: RootState) => state.notifications)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap()
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
      })
    }
  }

  const unreadNotifications = items.filter(n => !n.read)
  const readNotifications = items.filter(n => n.read)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and email preferences
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : items.length > 0 ? (
              items.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/60" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : unreadNotifications.length > 0 ? (
              unreadNotifications.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground/60" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No unread notifications
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <aside>
          <EmailPreferences />
        </aside>
      </div>
    </div>
  )
} 
