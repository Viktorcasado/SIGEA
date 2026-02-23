import { createContext, useState, useContext, ReactNode, FC, useMemo, useEffect, useCallback } from 'react';
import { Notification } from '@/src/types';
import { supabase } from '@/src/integrations/supabase/client';
import { useUser } from './UserContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'lida'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: FC<{children: ReactNode}> = ({ children }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formatted: Notification[] = data.map(n => ({
        id: n.id,
        userId: n.user_id,
        titulo: n.title,
        mensagem: n.content,
        tipo: n.type as any,
        lida: n.is_read,
        createdAt: new Date(n.created_at),
      }));
      setNotifications(formatted);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();

    // Inscrição para atualizações em tempo real
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.lida).length;
  }, [notifications]);

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'lida'>) => {
    if (!user) return;

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: notificationData.titulo,
      content: notificationData.mensagem,
      type: notificationData.tipo,
      is_read: false
    });
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      addNotification, 
      markAsRead, 
      markAllAsRead, 
      deleteNotification,
      loading
    }}>
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