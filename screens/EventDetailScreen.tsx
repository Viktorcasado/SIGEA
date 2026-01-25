import React, { useState, useEffect, useCallback } from 'react';
import { Event, Activity } from '../types';
import Icon from '../components/Icon';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import NotificationPermissionModal from '../components/NotificationPermissionModal';

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
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
  const [registeredActivities, setRegisteredActivities] = useState<Set<number>>(new Set());
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [reminder, setReminder] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const reminderKey = `reminder_${event.id}`;
  
  useEffect(() => {
    const savedReminder = localStorage.getItem(reminderKey);
    if (savedReminder) {
        if (new Date(savedReminder).getTime() < Date.now()) {
            localStorage.removeItem(reminderKey);
        } else {
            setReminder(savedReminder);
        }
    }
  }, [reminderKey]);

  const fetchEventData = useCallback(async () => {
    if (!user) {
        setActivitiesLoading(false);
        return;
    }

    setActivitiesLoading(true);
    setActivitiesError(null);

    try {
        // Buscamos atividades primeiro (dado principal)
        const { data: actsData, error: actsErr } = await supabase
            .from('activities')
            .select('*')
            .eq('event_id', event.id)
            .order('start_time');
        
        if (actsErr) throw actsErr;
        setActivities(actsData as Activity[] || []);

        // Buscamos inscrições separadamente para não quebrar a tela se falhar (ex: RLS)
        try {
            const { data: regsData, error: regsErr } = await supabase
                .from('activity_registrations')
                .select('activity_id')
                .eq('user_id', user.id);
            
            if (!regsErr && regsData) {
                setRegisteredActivities(new Set(regsData.map(r => r.activity_id)));
            }
        } catch (innerErr) {
            console.warn("Aviso: Falha ao carregar inscrições de atividades, mas a programação foi carregada.");
        }

    } catch (err: any) {
        console.error("[SIGEA] Erro ao carregar dados do evento:", err);
        setActivitiesError(err.message || "Não foi possível carregar a programação.");
    } finally {
        setActivitiesLoading(false);
    }
  }, [event.id, user]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const hasTimeConflict = (newActivity: Activity): boolean => {
    const newStart = new Date(newActivity.start_time).getTime();
    const newEnd = new Date(newActivity.end_time).getTime();
    const allSelectedActivities = activities.filter(a => selectedActivities.has(a.id));

    for (const selected of allSelectedActivities) {
        const selectedStart = new Date(selected.start_time).getTime();
        const selectedEnd = new Date(selected.end_time).getTime();
        if (Math.max(newStart, selectedStart) < Math.min(newEnd, selectedEnd)) {
            return true;
        }
    }
    return false;
  };

  const handleSelectActivity = (activity: Activity) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activity.id)) {
        newSelected.delete(activity.id);
    } else {
        if (hasTimeConflict(activity)) {
            setFeedback({ message: 'Conflito de horário detectado!', type: 'error' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }
        newSelected.add(activity.id);
    }
    setSelectedActivities(newSelected);
  };
  
  const handleRegistration = async () => {
    if (!user || selectedActivities.size === 0) return;

    setIsRegistering(true);
    setFeedback(null);

    const registrationsToInsert = Array.from(selectedActivities).map(activityId => ({
        event_id: event.id,
        activity_id: activityId,
        user_id: user.id,
    }));

    const { error } = await supabase.from('activity_registrations').insert(registrationsToInsert);

    setIsRegistering(false);

    if (error) {
        console.error("Erro na inscrição da atividade:", error);
        if (error.code === '23505') { // Unique violation
             setFeedback({ message: 'Você já está inscrito em uma das atividades.', type: 'error' });
        } else {
            setFeedback({ message: 'Erro ao salvar. Tente novamente.', type: 'error' });
        }
    } else {
        setFeedback({ message: 'Inscrição nas atividades confirmada!', type: 'success' });
        setRegisteredActivities(prev => new Set([...prev, ...selectedActivities]));
        setSelectedActivities(new Set());
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleReminderClick = () => {
    if (reminder) {
      handleCancelReminder();
      return;
    }
    
    if (typeof Notification === 'undefined') {
        setFeedback({ message: 'Notificações não são suportadas neste navegador.', type: 'error' });
        setTimeout(() => setFeedback(null), 3000);
        return;
    }

    if (Notification.permission === 'granted') {
      setShowDatePicker(true);
    } else if (Notification.permission === 'denied') {
      setPermissionBlocked(true);
      setShowPermissionModal(true);
    } else { // 'default'
      setPermissionBlocked(false);
      setShowPermissionModal(true);
    }
  };

  const handleAllowNotifications = async () => {
    setShowPermissionModal(false);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setShowDatePicker(true);
    } else {
      setFeedback({ message: 'Permissão para notificações negada.', type: 'error' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDenyNotifications = () => {
    setShowPermissionModal(false);
    if (!permissionBlocked) {
      setFeedback({ message: 'Ok, não enviaremos notificações.', type: 'info' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSetReminder = async (isoDateString: string) => {
    const reminderTime = new Date(isoDateString);
    if (isNaN(reminderTime.getTime()) || reminderTime.getTime() <= Date.now()) {
        setFeedback({ message: 'Por favor, escolha uma data futura.', type: 'error' });
        setTimeout(() => setFeedback(null), 3000);
        return;
    }

    if (Notification.permission !== 'granted') {
        setFeedback({ message: 'Permissão para notificações é necessária.', type: 'error' });
        setTimeout(() => setFeedback(null), 3000);
        setShowDatePicker(false);
        return;
    }

    const delay = reminderTime.getTime() - Date.now();

    setTimeout(() => {
        new Notification('Não perca a inscrição!', {
            body: `As inscrições para o evento "${event.title}" terminam em breve.`,
            icon: 'https://i.postimg.cc/SNqD0sSg/sigea-logo-white.png'
        });
        localStorage.removeItem(reminderKey);
    }, delay);

    localStorage.setItem(reminderKey, isoDateString);
    setReminder(isoDateString);
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
    setFeedback({ message: 'Lembrete definido com sucesso!', type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
    setShowDatePicker(false);
  };

  const handleCancelReminder = () => {
    localStorage.removeItem(reminderKey);
    setReminder(null);
    setFeedback({ message: 'Lembrete removido.', type: 'info' });
    setTimeout(() => setFeedback(null), 3000);
  };
  
  const formatTime = (timeStr: string) => {
    try {
        return new Date(timeStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch { return 'N/A'; }
  };
  
  const renderActivities = () => {
    if (activitiesLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-48 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ifal-green"></div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Carregando Programação...</p>
        </div>
      );
    }
    if (activitiesError) {
      return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <Icon name="life-buoy" className="w-10 h-10 mx-auto mb-3 text-red-500" />
            <h4 className="font-bold text-gray-900 dark:text-white">Ops! Erro de Conexão</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{activitiesError}</p>
            <button 
                onClick={fetchEventData}
                className="bg-ifal-green/10 text-ifal-green px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest"
            >
                Tentar Recarregar
            </button>
        </div>
      );
    }
    if (activities.length === 0) {
      return (
        <div className="text-center p-12 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <Icon name="layout" className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[11px]">Nenhuma atividade disponível</p>
        </div>
      );
    }

    return (
        <div className="relative">
            <div className="absolute left-10 top-5 h-[calc(100%-2.5rem)] w-px bg-gray-200 dark:bg-gray-700"></div>

            {activities.map((activity) => {
                const isRegistered = registeredActivities.has(activity.id);
                const isSelected = selectedActivities.has(activity.id);
                
                const cardStateClasses = isRegistered 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800' 
                    : isSelected 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/50';
                
                const dotStateClasses = isRegistered 
                    ? 'bg-green-500'
                    : isSelected
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600';

                return (
                    <div key={activity.id} className="flex items-start mb-6 relative">
                        <div className="w-16 text-right pr-4 flex-shrink-0">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{formatTime(activity.start_time)}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-4 border-[#F2F2F7] dark:border-black z-10 ${dotStateClasses}`}></div>
                        <div className="flex-1 ml-4">
                            <button
                                onClick={() => handleSelectActivity(activity)}
                                disabled={isRegistered || isRegistering}
                                className={`w-full p-4 rounded-xl text-left border transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed ${cardStateClasses}`}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 flex-1 pr-2">{activity.title}</h4>
                                    {activity.generates_certificate && (
                                        <div title="Gera Certificado">
                                            <Icon name="star_fill" className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">{activity.type}</span>
                                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700 px-2 py-0.5 rounded-full">{activity.hours}h</span>
                                </div>
                                <div className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 text-sm mt-1.5">
                                    <Icon name="location" className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };
  
  const DatePickerModal = () => {
    const [dateValue, setDateValue] = useState(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
    
    if (!showDatePicker) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg w-full max-w-sm rounded-2xl shadow-xl p-4 text-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Definir Lembrete</h3>
                <input
                    type="datetime-local"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg p-3 border border-gray-300 dark:border-gray-600 mb-4 text-gray-800 dark:text-gray-200"
                />
                <div className="flex space-x-2">
                    <button onClick={() => setShowDatePicker(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2.5 rounded-lg">
                        Cancelar
                    </button>
                    <button onClick={() => handleSetReminder(dateValue)} className="flex-1 bg-ifal-green text-white font-semibold py-2.5 rounded-lg">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
  };
  
  return (
    <div className="min-h-screen pb-40 bg-[#F2F2F7] dark:bg-black font-['-apple-system'] animate-fade-in">
      <div className="relative h-[45vh] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
        <img 
          src={imageError || !event.imageUrl ? "https://i.postimg.cc/d1wz2p28/sigea-logo-green.png" : event.imageUrl} 
          alt={event.title} 
          className={imageError || !event.imageUrl ? "w-40 opacity-80" : "w-full h-full object-cover scale-105"} 
          onError={() => setImageError(true)} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F2F2F7] dark:from-black via-transparent to-transparent"></div>
        <button onClick={onBack} className="absolute top-8 left-6 w-12 h-12 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white z-10 active:scale-90 transition-transform">
          <Icon name="arrow-left" className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 -mt-12 relative">
        <div className="bg-ifal-green text-white inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg mb-4">
            {event.category}
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">{event.title}</h1>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
             <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Sobre o Evento</h3>
             <p className="text-[16px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {event.description || "Nenhuma descrição detalhada disponível."}
             </p>
        </div>

        <div className="mt-10 pt-8">
             <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Programação</h3>
             {renderActivities()}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 z-20 flex flex-col items-center">
        {feedback && (
          <div className={`mb-3 px-4 py-2 rounded-full text-sm font-bold animate-bounce shadow-lg ${
            feedback.type === 'success' ? 'bg-green-500 text-white' : 
            feedback.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {feedback.message}
          </div>
        )}
        
        <div className="w-full max-w-lg flex items-center space-x-3">
            <button 
                onClick={handleRegistration}
                disabled={isRegistering || selectedActivities.size === 0}
                className="flex-1 bg-ifal-green text-white h-16 rounded-[22px] font-black text-[15px] shadow-2xl shadow-ifal-green/30 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
            >
                {isRegistering ? 'Sincronizando...' : (selectedActivities.size > 0 ? `Confirmar Inscrição (${selectedActivities.size})` : 'Selecione uma atividade')}
            </button>
             <button
                onClick={handleReminderClick}
                className={`w-16 h-16 flex-shrink-0 rounded-[22px] flex items-center justify-center shadow-lg active:scale-95 transition-all ${
                    reminder ? 'bg-ifal-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                aria-label={reminder ? 'Remover lembrete' : 'Adicionar lembrete'}
            >
                <Icon name={reminder ? 'clock_fill' : 'clock'} className="w-7 h-7" />
            </button>
        </div>
      </div>
      <DatePickerModal />
      <NotificationPermissionModal 
        isOpen={showPermissionModal}
        onAllow={handleAllowNotifications}
        onDeny={handleDenyNotifications}
        isBlocked={permissionBlocked}
      />
    </div>
  );
};

export default EventDetailScreen;