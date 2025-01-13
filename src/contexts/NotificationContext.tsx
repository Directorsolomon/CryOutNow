import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { user, getToken } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;

    const connectWebSocket = async () => {
      const token = await getToken();
      const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}?token=${token}`);

      ws.onopen = () => {
        console.log('Connected to notification service');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connection_success') {
            console.log(data.message);
            return;
          }

          // Add new notification
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
            read: false,
            createdAt: new Date(),
          };

          setNotifications(prev => [newNotification, ...prev]);

          // Show toast for new notification
          toast({
            title: data.title,
            description: data.message,
            duration: 5000,
          });
        } catch (error) {
          console.error('Error handling notification:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Disconnected from notification service');
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    };

    connectWebSocket();
  }, [user, getToken]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 
