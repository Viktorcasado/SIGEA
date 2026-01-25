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

const groupNotificationsByDate = (notifications: Notification[]) => {
  const groups: { [key: string]: Notification[] } = {
    hoje: [],
    ontem: [],
    anteriores: [],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach(notification => {
    const notificationDate = new Date(notification.created_at);
    notificationDate.setHours(0, 0, 0, 0);

    if (notificationDate.getTime() === today.getTime()) {
      groups.hoje.push(notification);
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      groups.ontem.push(notification);
    } else {
      groups.anteriores.push(notification);
    }
  });

  return groups;
};


const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const fetchNotifications = useCallback(async (isRefresh = false) => {
        if (!user) { setLoading(false); return; }
        if (!isRefresh) setLoading(true);
        setError(null);
        try {
            // Mock data for demonstration purposes as the 'notifications' table might not exist
            const mockData = [
                { id: '1', user_id: user.id, title: 'Inscrição Confirmada!', subtitle: 'SECINFO 2024', content: 'Sua inscrição para a Semana de Informática foi confirmada. Prepare-se para uma semana de muito aprendizado!', type: 'event', is_read: false, created_at: new Date().toISOString() },
                { id: '2', user_id: user.id, title: 'Certificado Disponível', subtitle: 'JEPEX 2024', content: 'O seu certificado de participação na JEPEX 2024 já está disponível para download na aba "Certificados".', type: 'announcement', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
                { id: '3', user_id: user.id, title: 'Sistema Atualizado', subtitle: 'Versão 1.1.0', content: 'O app SIGEA foi atualizado com melhorias de performance e correção de bugs para uma melhor experiência.', type: 'update', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
            ];
            setNotifications(mockData as Notification[]);
        } catch (err: any) {
            setError('Falha ao carregar notificações.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleNotificationClick = async (notification: Notification) => {
        setSelectedNotification(notification);
        if (!notification.is_read) {
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            // In a real scenario, you would update the DB here:
            // await supabase.from('notifications').update({ is_read: true }).match({ id: notification.id });
        }
    };
    
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ifal-green"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 px-4">
                    <Icon name="life-buoy" className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{error}</h3>
                    <button onClick={() => fetchNotifications()} className="mt-6 bg-ifal-green text-white font-semibold py-2 px-6 rounded-xl">
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        if (notifications.length === 0) {
            return (
                 <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <Icon name="bell" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold">Nenhuma Notificação</h3>
                    <p>Suas notificações e alertas aparecerão aqui.</p>
                </div>
            );
        }
        
        const grouped = groupNotificationsByDate(notifications);
        const sections = [
            { title: 'Hoje', data: grouped.hoje },
            { title: 'Ontem', data: grouped.ontem },
            { title: 'Anteriores', data: grouped.anteriores },
        ];

        return (
            <div className="space-y-6">
                {sections.map(section => (
                    section.data.length > 0 && (
                        <div key={section.title}>
                           <h2 className="px-4 pb-2 text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">{section.title}</h2>
                           <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
                               {section.data.map((item, index) => (
                                   <div key={item.id}>
                                       <NotificationItem notification={item} onClick={() => handleNotificationClick(item)} />
                                       {index < section.data.length - 1 && <div className="ml-20 h-px bg-gray-200 dark:bg-gray-700/50" />}
                                   </div>
                               ))}
                           </div>
                        </div>
                    )
                ))}
            </div>
        );
    };

    const AlertDialog = () => {
        if (!selectedNotification) return null;

        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNotification(null)}>
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg w-full max-w-sm rounded-2xl shadow-xl p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{selectedNotification.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{selectedNotification.content}</p>
                    <button onClick={() => setSelectedNotification(null)} className="mt-6 w-full bg-ifal-green text-white font-semibold py-2.5 rounded-lg">
                        OK
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <PageHeader
                title="Notificações"
                onBack={onBack}
                actionButton={
                    <button
                        onClick={() => fetchNotifications(true)}
                        className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-500/10"
                        aria-label="Atualizar Notificações"
                    >
                        <Icon name="arrow-path" className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                }
            />
            <main className="p-4">
                {renderContent()}
            </main>
            <AlertDialog />
        </div>
    );
};

export default NotificationsScreen;
