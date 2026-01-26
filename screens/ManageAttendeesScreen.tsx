import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, Attendee, UserType, Activity } from '../types';
import Icon from '../components/Icon';
import PageHeader from '../components/PageHeader';
import { supabase } from '../services/supabaseClient';
import ToggleSwitch from '../components/ToggleSwitch';
import ActionSheet from '../components/ActionSheet';
import AlertDialog from '../components/AlertDialog';
import ContextMenu from '../components/ContextMenu';

interface ManageAttendeesScreenProps {
  event: Event;
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onEditActivity: (activity: Activity) => void;
  isDesktop: boolean;
}

const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const UserTypeBadge: React.FC<{ type?: UserType }> = ({ type }) => {
    const styles = {
        aluno: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        servidor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        externo: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    };
    const userType = type || 'externo';
    return (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${styles[userType]}`}>
            {userType.toUpperCase()}
        </span>
    );
};

const ManageAttendeesScreen: React.FC<ManageAttendeesScreenProps> = ({ event, onBack, onNavigate, onEditActivity, isDesktop }) => {
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedActivityForAction, setSelectedActivityForAction] = useState<Activity | null>(null);
    const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: attendeesData, error: attendeesErr } = await supabase
                .from('event_registrations')
                .select(`
                    status,
                    profiles (id, full_name, email, registration_number, avatar_url, user_type)
                `)
                .eq('event_id', event.id);

            if (attendeesErr) throw attendeesErr;
            
            if (attendeesData) {
                const mappedAttendees = attendeesData
                    .filter(reg => reg.profiles) 
                    .map((reg: any): Attendee => ({
                        user_id: reg.profiles.id,
                        id: reg.profiles.registration_number || reg.profiles.id,
                        name: reg.profiles.full_name,
                        email: reg.profiles.email,
                        status: reg.status === 'Present' ? 'Present' : 'Absent',
                        avatar_url: reg.profiles.avatar_url,
                        user_type: reg.profiles.user_type,
                    }));
                setAttendees(mappedAttendees);
            }

            const { data: actsData, error: actsErr } = await supabase
                .from('activities')
                .select('*')
                .eq('event_id', event.id)
                .order('start_time', { ascending: true });

            if (actsErr) throw actsErr;
            if (actsData) {
                setActivities(actsData as Activity[]);
            }

        } catch (e: any) {
            console.error("ERRO SUPABASE:", e.message);
            setError("Não foi possível carregar os dados. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    }, [event.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleDeleteActivity = async (activityId: number) => {
        const { error: deleteError } = await supabase
            .from('activities')
            .delete()
            .match({ id: activityId });
        
        if (deleteError) {
            alert(`Erro: ${deleteError.message}`);
        } else {
            if (navigator.vibrate) navigator.vibrate(50);
            setActivities(prev => prev.filter(a => a.id !== activityId));
        }
    };

    const handlePresenceChange = async (attendee: Attendee, isPresent: boolean) => {
        const newStatus = isPresent ? 'Present' : 'Absent';
        setAttendees(prev => prev.map(att => att.user_id === attendee.user_id ? { ...att, status: newStatus } : att));
        
        const { error: updateError } = await supabase
            .from('event_registrations')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .match({ event_id: event.id, user_id: attendee.user_id });
        
        if (updateError) {
            setAttendees(prev => prev.map(att => att.user_id === attendee.user_id ? { ...att, status: attendee.status } : att));
        }
    };
    
    const formatTime = (timeStr: string) => {
        try {
            return new Date(timeStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch { return 'N/A'; }
    };

    const filteredAttendees = useMemo(() => 
        attendees.filter(att => 
            att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (att.id && att.id.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [attendees, searchTerm]);

    const presentCount = useMemo(() => 
        attendees.filter(att => att.status === 'Present').length, 
    [attendees]);
    
     const renderActivities = () => {
        if (activities.length === 0) {
            return (
                <div className="text-center p-10 bg-gray-50 dark:bg-gray-900 rounded-[24px] border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-400 dark:text-gray-600 font-black uppercase tracking-[0.2em] text-[10px]">Nenhuma atividade criada</p>
                </div>
            )
        }

        const activityListContainerClasses = isDesktop
            ? "space-y-2"
            : "bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden";

        return (
             <div className={activityListContainerClasses}>
                {activities.map((activity, index) => {
                    const activityActions = [
                        {
                            label: "Editar Atividade",
                            onClick: () => onEditActivity(activity)
                        },
                        {
                            label: "Excluir Atividade",
                            isDestructive: true,
                            onClick: () => setActivityToDelete(activity)
                        }
                    ];

                    const cardContent = (
                        <>
                            <div className="w-12 h-12 bg-ifal-green/10 dark:bg-ifal-green/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Icon name="layout" className="w-6 h-6 text-ifal-green" />
                            </div>
                            <div className="flex-1 ml-4 min-w-0">
                                <p className="font-black text-gray-900 dark:text-gray-100 text-sm truncate leading-tight">{activity.title}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                    {formatTime(activity.start_time)} • {activity.hours}h
                                </p>
                            </div>
                            {!isDesktop && (
                                <div className="flex items-center ml-2">
                                    <button
                                        onClick={() => setSelectedActivityForAction(activity)}
                                        className="w-11 h-11 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-500/10 active:scale-90 transition-transform"
                                        title="Mais opções"
                                    >
                                        <Icon name="ellipsis-vertical" className="w-6 h-6" />
                                    </button>
                                </div>
                            )}
                        </>
                    );

                    if (isDesktop) {
                         return (
                            <ContextMenu
                                key={activity.id}
                                actions={activityActions}
                                trigger={
                                    <div className="flex items-center p-5 bg-white dark:bg-[#1C1C1E] rounded-xl border border-black/5 dark:border-white/5 group transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-context-menu">
                                        {cardContent}
                                    </div>
                                }
                            />
                        );
                    }

                    return (
                        <div key={activity.id} className={`flex items-center p-5 ${index < activities.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''}`}>
                            {cardContent}
                        </div>
                    );
                })}
            </div>
        )
    }

    const renderAttendees = () => {
        if (attendees.length === 0) {
            return (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700/50">
                    <Icon name="users-group" className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                    <h3 className="text-xl font-bold">Sem Inscrições</h3>
                    <p className="text-sm">Ainda não há participantes para este evento.</p>
                </div>
            );
        }
        return (
            <div className="mt-10">
                 <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Icon name="search" className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                        type="text"
                        placeholder="Buscar por nome ou matrícula..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 rounded-[24px] py-4.5 pl-14 pr-4 text-[15px] font-bold border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-ifal-green shadow-sm"
                    />
                </div>
                 <h2 className="px-4 pb-3 text-[11px] font-black tracking-[0.25em] text-gray-400 dark:text-gray-500 uppercase border-l-4 border-ifal-green ml-2 mb-6">
                    Lista de Inscritos ({filteredAttendees.length})
                 </h2>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden">
                    {filteredAttendees.map((attendee, index) => (
                        <div key={attendee.user_id} className={`flex items-center p-5 ${index < filteredAttendees.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''}`}>
                            {attendee.avatar_url ? (
                                <img src={attendee.avatar_url} alt={attendee.name} className="w-14 h-14 rounded-[20px] object-cover bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                            ) : (
                                <div className="w-14 h-14 rounded-[20px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-ifal-green flex-shrink-0 border border-black/5 dark:border-white/5">
                                    {getInitials(attendee.name)}
                                </div>
                            )}
                            <div className="flex-1 ml-4 min-w-0">
                                <p className="font-black text-gray-900 dark:text-gray-100 text-[15px] truncate leading-tight">{attendee.name}</p>
                                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-500 truncate mt-0.5">{attendee.id || 'Sem Matrícula'}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <UserTypeBadge type={attendee.user_type} />
                                </div>
                            </div>
                            <div className="ml-4">
                                <ToggleSwitch enabled={attendee.status === 'Present'} setEnabled={(isPresent) => handlePresenceChange(attendee, isPresent)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="bg-[#F2F2F7] dark:bg-black min-h-screen">
                <PageHeader title="Carregando..." onBack={onBack} />
                <div className="flex flex-col justify-center items-center h-[70vh] space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ifal-green"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sincronizando Gestão</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F2F2F7] dark:bg-black min-h-screen pb-32 font-sans overflow-x-hidden">
            <PageHeader title="Gestão do Evento" onBack={onBack} />
            
            <main className="p-6">
                <div className="px-2 mb-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-ifal-green mb-1 block">Painel de Controle</span>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{event.title}</h1>
                    <div className="flex items-center space-x-2 mt-3 text-gray-500">
                        <Icon name="users-group" className="w-4 h-4" />
                        <p className="text-[11px] font-bold uppercase tracking-widest">
                            {presentCount} presentes de {attendees.length} inscritos
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-12 px-2">
                    <button
                        onClick={() => onNavigate('Adicionar Atividade')}
                        className="bg-blue-600 text-white font-black py-5 rounded-[24px] flex flex-col items-center justify-center space-y-2 shadow-xl shadow-blue-500/30 active:scale-95 transition-all"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="plus" className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em]">Criar Atividade</span>
                    </button>
                    <button
                         onClick={() => onNavigate('Escanear Credencial')}
                         className="bg-gray-900 dark:bg-[#1C1C1E] text-white font-black py-5 rounded-[24px] flex flex-col items-center justify-center space-y-2 shadow-2xl active:scale-95 transition-all"
                    >
                         <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <Icon name="qrcode" className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em]">Scanner QR</span>
                    </button>
                </div>

                <div className="space-y-12">
                    <section>
                         <h2 className="px-4 pb-3 text-[11px] font-black tracking-[0.25em] text-gray-400 dark:text-gray-500 uppercase border-l-4 border-blue-500 ml-2 mb-6">Programação</h2>
                         {renderActivities()}
                    </section>
                    <section>
                         {renderAttendees()}
                    </section>
                </div>
            </main>
             <ActionSheet
                isOpen={!!selectedActivityForAction && !isDesktop}
                onClose={() => setSelectedActivityForAction(null)}
                title="Gerenciar Atividade"
                actions={[
                    {
                        label: "Editar Programação",
                        onClick: () => {
                            if (selectedActivityForAction) {
                                onEditActivity(selectedActivityForAction);
                            }
                            setSelectedActivityForAction(null);
                        }
                    },
                    {
                        label: "Excluir Atividade",
                        isDestructive: true,
                        onClick: () => {
                            if (selectedActivityForAction) {
                                setActivityToDelete(selectedActivityForAction);
                            }
                            setSelectedActivityForAction(null);
                        }
                    }
                ]}
            />
            <AlertDialog
                isOpen={!!activityToDelete}
                title="Excluir Atividade?"
                content="Esta ação não pode ser desfeita e removerá permanentemente a atividade da programação."
                actions={[
                    {
                        label: "Cancelar",
                        onClick: () => setActivityToDelete(null),
                    },
                    {
                        label: "Excluir",
                        isDestructive: true,
                        onClick: () => {
                            if (activityToDelete) {
                                handleDeleteActivity(activityToDelete.id);
                            }
                            setActivityToDelete(null);
                        },
                    },
                ]}
            />
        </div>
    );
};

export default ManageAttendeesScreen;
