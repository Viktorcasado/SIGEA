import { createContext, useState, useContext, ReactNode, FC, useMemo } from 'react';
import { Notification, NotificationType } from '@/src/types';
import { mockNotifications as initialNotifications } from '@/src/data/mock';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'lida'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: FC<{children: ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.lida).length;
  }, [notifications]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'lida'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif${Date.now()}`,
      userId: 'user001', // Mock user ID
      lida: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
