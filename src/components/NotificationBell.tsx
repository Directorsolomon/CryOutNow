import React from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'prayer_chain_turn':
        navigate(`/chains/${notification.data.chainId}`);
        break;
      case 'group_invitation':
        navigate(`/groups/${notification.data.groupId}`);
        break;
      case 'upcoming_session':
        navigate(`/groups/${notification.data.groupId}/sessions/${notification.data.sessionId}`);
        break;
      case 'prayer_request_update':
      case 'new_comment':
        navigate(`/prayers/${notification.data.requestId}`);
        break;
      default:
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex flex-col items-start p-4 cursor-pointer',
                  !notification.read && 'bg-muted/50'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{notification.title}</span>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 