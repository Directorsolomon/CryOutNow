import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  Notification,
} from '@/store/slices/notificationsSlice'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
  Bell,
  CheckCircle2,
  HandsPraying,
  Loader2,
  MessageCircle,
  Users,
} from 'lucide-react'

const NOTIFICATION_ICONS = {
  prayer_turn: HandsPraying,
  prayer_request: HandsPraying,
  comment: MessageCircle,
  chain_invite: Users,
  prayer_answered: CheckCircle2,
}

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: () => void }) {
  const navigate = useNavigate()
  const Icon = NOTIFICATION_ICONS[notification.type]

  const handleClick = () => {
    onRead()
    if (notification.chainId) {
      navigate(`/prayer-chains/${notification.chainId}`)
    } else if (notification.requestId) {
      navigate(`/prayer-feed?request=${notification.requestId}`)
    }
  }

  return (
    <button
      className={`w-full px-4 py-3 text-left hover:bg-muted/50 ${!notification.read ? 'bg-muted/20' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        <div className="mt-1">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </button>
  )
}

export default function NotificationsMenu() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { items, unreadCount, loading } = useSelector((state: RootState) => state.notifications)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark notification as read',
      })
    }
  }

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-2">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto px-2 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <ScrollArea className="h-[400px]">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => handleMarkAsRead(notification.id)}
              />
            ))}
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        )}
        <Separator />
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/notifications')}
          >
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 
