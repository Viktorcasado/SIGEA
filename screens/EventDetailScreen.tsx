import React, { useState, useEffect, useCallback } from 'react';
import { Event, Activity } from '../types';
import Icon from '../components/Icon';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import Logo from '../components/Logo';
import NotificationPermissionModal from '../components/NotificationPermissionModal';
import { requestNotificationPermission, scheduleNotificationForActivity, isNotificationScheduled } from '../services/notificationService';


interface EventDetailScreenProps {
  event: Event;
  onBack: () => void;
}

type FeedbackType = 'success' | 'error' | 'info';

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ event, onBack }) => {
  const { user } = useUser();
  const [feedback, setFeedback] = useState<{ message: string; type: FeedbackType } | null>(null);
  const [imageError, setImageError] = useState(false);
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
  const [registeredActivities, setRegisteredActivities] = useState<Set<number>>(new Set());
  const [isRegistering, setIsRegistering] = useState(false);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isPermissionBlocked, setIsPermissionBlocked] = useState(Notification.permission === 'denied');
  const [activitiesToNotify, setActivitiesToNotify] = useState<Activity[]>([]);

  const fetchEventData = useCallback(async () => {
    if (!user) {
        setActivitiesLoading(false);
        return;
    }

    setActivitiesLoading(true);

    try {
        const [actsRes, regsRes] = await Promise.all([
            supabase.from('activities').select('*').eq('event_id', event.id).order('start_time'),
            supabase.from('activity_registrations').select('activity_id').eq('user_id', user.id)
        ]);
        
        if (actsRes.error) throw actsRes.error;
        setActivities(actsRes.data as Activity[] || []);

        if (!regsRes.error && regsRes.data) {
            setRegisteredActivities(new Set(regsRes.data.map(r => r.activity_id)));
        }

    } catch (err: any) {
        console.error("[SIGEA] Erro ao carregar detalhes:", err);
    } finally {
        setActivitiesLoading(false);
    }
  }, [event.id, user]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleSelectActivity = (activity: Activity) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activity.id)) {
        newSelected.delete(activity.id);
    } else {
        newSelected.add(activity.id);
    }
    setSelectedActivities(newSelected);
  };
  
  const handleRegistration = async () => {
    if (!user || selectedActivities.size === 0) return;
    setIsRegistering(true);
    
    try {
        const justRegisteredActivities = activities.filter(act => selectedActivities.has(act.id));
        
        const registrations = justRegisteredActivities.map(act => ({ 
            event_id: event.id, 
            activity_id: act.id, 
            user_id: user.id 
        }));

        const { error } = await supabase.from('activity_registrations').insert(registrations);

        if (error) throw error;

        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        setFeedback({ message: 'Inscrição realizada! ✅', type: 'success' });
        setRegisteredActivities(prev => new Set([...prev, ...selectedActivities]));
        setSelectedActivities(new Set());
        
        // Notification Logic
        if ('Notification' in window) {
            const permission = Notification.permission;
            if (permission === 'granted') {
                justRegisteredActivities.forEach(scheduleNotificationForActivity);
            } else if (permission === 'default') {
                setActivitiesToNotify(justRegisteredActivities);
                setShowNotificationModal(true);
            } else {
                setIsPermissionBlocked(true);
            }
        }

    } catch (e) {
        setFeedback({ message: 'Erro ao processar inscrição.', type: 'error' });
    } finally {
        setIsRegistering(false);
        setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleAllowNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
        activitiesToNotify.forEach(scheduleNotificationForActivity);
        setIsPermissionBlocked(false);
    }
    if (permission === 'denied') {
        setIsPermissionBlocked(true);
    }
    setShowNotificationModal(false);
    setActivitiesToNotify([]);
  };

  const handleDenyNotifications = () => {
    setShowNotificationModal(false);
    setActivitiesToNotify([]);
  };


  const formatTime = (timeStr: string) => {
    try { return new Date(timeStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch { return '--:--'; }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
    } catch { return dateStr; }
  };
  
  const renderTimeline = () => {
    if (activitiesLoading) return (
        <div className="py-20 flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-3 border-ifal-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carregando Cronograma...</p>
        </div>
    );
    
    if (activities.length === 0) return (
        <div className="p-12 text-center bg-white dark:bg-white/5 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <Icon name="calendar" className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sem atividades agendadas</p>
        </div>
    );

    return (
        <div className="relative pl-4">
            {/* Linha Vertical da Timeline (SliverList visual) */}
            <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

            {activities.map((activity) => {
                const isRegistered = registeredActivities.has(activity.id);
                const isSelected = selectedActivities.has(activity.id);
                
                return (
                    <div key={activity.id} className="relative flex items-start mb-10 last:mb-0">
                        {/* Indicador de Timeline (Bullet) */}
                        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-[#F2F2F7] dark:border-black z-10 transition-all duration-300 ${
                            isRegistered ? 'bg-ifal-green scale-110 shadow-lg shadow-ifal-green/20' : 
                            isSelected ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 
                            'bg-gray-300 dark:bg-gray-700'
                        }`}></div>

                        <div className="ml-10 flex-1">
                            <button
                                onClick={() => handleSelectActivity(activity)}
                                disabled={isRegistered || isRegistering}
                                className={`w-full p-5 rounded-[24px] text-left border transition-all duration-300 active:scale-[0.98] ${
                                    isRegistered ? 'bg-ifal-green/5 border-ifal-green/20' : 
                                    isSelected ? 'bg-blue-500/5 border-blue-500' : 
                                    'bg-white dark:bg-[#1C1C1E] border-black/5 dark:border-white/5 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black uppercase text-ifal-green tracking-[0.15em]">
                                        {formatTime(activity.start_time)} • {activity.type}
                                    </span>
                                    {isRegistered && <Icon name="check" className="w-4 h-4 text-ifal-green" />}
                                </div>
                                <h4 className="font-bold text-[17px] text-gray-900 dark:text-white mb-2 leading-tight">{activity.title}</h4>
                                <div className="flex items-center space-x-4 text-[10px] font-black text-gray-400 uppercase tracking-tight">
                                    <div className="flex items-center"><Icon name="location" className="w-3 h-3 mr-1" /> {activity.location}</div>
                                    <div className="flex items-center"><Icon name="clock" className="w-3 h-3 mr-1" /> {activity.hours}h</div>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };
  
  return (
    <div className="min-h-screen pb-40 bg-[#F2F2F7] dark:bg-black animate-fade-in overflow-x-hidden">
      {/* Sliver-like Banner */}
      <div className="relative h-[48vh] bg-white dark:bg-[#111] overflow-hidden">
        {imageError || !event.imageUrl ? (
          <div className="w-full h-full flex items-center justify-center opacity-10 grayscale"><Logo className="w-48" /></div>
        ) : (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" onError={() => setImageError(true)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F2F2F7] dark:from-black via-transparent to-black/30"></div>
        
        {/* Navigation Glass (Cupertino Style) */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
            <button onClick={onBack} className="w-12 h-12 bg-black/10 backdrop-blur-2xl rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/20">
                <Icon name="arrow-left" className="w-6 h-6" />
            </button>
            <div className="px-5 py-2.5 bg-ifal-green text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                {event.category}
            </div>
        </div>
      </div>

      <div className="px-8 -mt-16 relative z-10">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-[0.95] tracking-tighter mb-8">
            {event.title}
        </h1>

        {/* Info Grid (Cupertino InfoRows equivalent) */}
        <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px] border border-black/5 shadow-sm">
                <div className="w-11 h-11 bg-ifal-green/10 text-ifal-green rounded-2xl flex items-center justify-center mb-4">
                    <Icon name="calendar" className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Início do Evento</p>
                <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">{formatDateLabel(event.date)}</p>
            </div>
            <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px] border border-black/5 shadow-sm">
                <div className="w-11 h-11 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                    <Icon name="location" className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Localização Principal</p>
                <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">{event.location}</p>
            </div>
        </div>

        <div className="space-y-16">
             {/* Sobre o Evento (SliverToBoxAdapter equivalent) */}
             <section>
                <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-6 border-l-4 border-ifal-green pl-4">Sobre o Evento</h3>
                <p className="text-[17px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {event.description || "Este evento institucional visa promover a integração acadêmica e o compartilhamento de conhecimentos técnicos e científicos através de atividades multicampi do IFAL."}
                </p>
             </section>

             {/* Programação (SliverList equivalent) */}
             <section>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] border-l-4 border-ifal-green pl-4">Programação Real</h3>
                    {activities.length > 0 && <span className="text-[10px] font-black text-ifal-green uppercase">{activities.length} Atividades</span>}
                </div>
                {renderTimeline()}
             </section>
        </div>
      </div>
      
      {/* Bottom Bar (CupertinoNavigationBar equivalent) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl border-t border-black/5 z-40 flex flex-col items-center shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        {feedback && (
          <div className={`absolute -top-14 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl animate-slide-up ${
            feedback.type === 'success' ? 'bg-ifal-green text-white' : 'bg-red-500 text-white'
          }`}>
            {feedback.message}
          </div>
        )}
        
        <div className="w-full max-w-lg flex items-center space-x-4">
            <button 
                onClick={handleRegistration}
                disabled={isRegistering || (selectedActivities.size === 0 && registeredActivities.size === 0)}
                className="flex-1 bg-ifal-green text-white h-16 rounded-[24px] font-black text-[15px] uppercase tracking-[0.1em] shadow-2xl shadow-ifal-green/30 active:scale-[0.96] transition-all disabled:opacity-40"
            >
                {isRegistering ? 'Sincronizando...' : (selectedActivities.size > 0 ? `Confirmar ${selectedActivities.size} Inscrição(ões)` : 'Realizar Inscrição Gratuita')}
            </button>
             <button
                className="w-16 h-16 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 rounded-[24px] flex items-center justify-center active:scale-90 transition-all border border-black/5"
            >
                <Icon name="clock" className="w-7 h-7" />
            </button>
        </div>
      </div>
      
      <NotificationPermissionModal 
        isOpen={showNotificationModal}
        onAllow={handleAllowNotifications}
        onDeny={handleDenyNotifications}
        isBlocked={isPermissionBlocked}
      />

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default EventDetailScreen;