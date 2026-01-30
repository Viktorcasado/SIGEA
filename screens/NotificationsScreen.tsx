import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import { Notification } from '../types';
import Icon from '../components/Icon';
import NotificationItem from '../components/NotificationItem';

interface NotificationsScreenProps {
  onBack: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const fetchNotifications = useCallback(async (isSilent = false) => {
        if (!user) return;
        if (!isSilent) setLoading(true);
        
        try {
            const { data, error } = await supabase
              .from('notifications')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (!error && data) {
              setNotifications(data as Notification[]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();

        // REAL-TIME: Escuta a inserção de novos avisos
        const channel = supabase
          .channel(`alerts_${user?.id}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` },
            (payload) => {
              console.log('[SIGEA] Novo aviso recebido:', payload.new);
              setNotifications(prev => [payload.new as Notification, ...prev]);
              // Feedback tátil se disponível
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    const handleNotificationClick = async (notification: Notification) => {
        setSelectedNotification(notification);
        if (!notification.is_read) {
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
        }
    };
    
    return (
        <div className="min-h-screen bg-[#F8F8FA] dark:bg-black">
            <PageHeader title="Notificações e Avisos" onBack={onBack} />
            <main className="container py-6 px-4">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ifal-green"></div></div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <Icon name="bell" className="w-12 h-12 mx-auto mb-4" />
                        <p className="font-bold uppercase text-[10px] tracking-widest">Sua caixa está vazia</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-black/5 shadow-sm">
                        {notifications.map((item, idx) => (
                            <div key={item.id}>
                                <NotificationItem notification={item} onClick={() => handleNotificationClick(item)} />
                                {idx < notifications.length - 1 && <div className="ml-20 h-px bg-gray-50 dark:bg-white/5" />}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Detalhe do Aviso */}
            {selectedNotification && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6" onClick={() => setSelectedNotification(null)}>
                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[32px] shadow-2xl p-8 animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-ifal-green/10 text-ifal-green rounded-2xl flex items-center justify-center">
                                <Icon name="bell" className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-gray-900 dark:text-white leading-tight">{selectedNotification.title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">{selectedNotification.content}</p>
                        <button onClick={() => setSelectedNotification(null)} className="w-full bg-ifal-green text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all uppercase text-xs tracking-widest">
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsScreen;