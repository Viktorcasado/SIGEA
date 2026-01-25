import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, Attendee, UserType, Activity } from '../types';
import Icon from '../components/Icon';
import PageHeader from '../components/PageHeader';
import { supabase } from '../services/supabaseClient';
import ToggleSwitch from '../components/ToggleSwitch';

interface ManageAttendeesScreenProps {
  event: Event;
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onEditActivity: (activity: Activity) => void;
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
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${styles[userType]}`}>
            {userType.toUpperCase()}
        </span>
    );
};

const ManageAttendeesScreen: React.FC<ManageAttendeesScreenProps> = ({ event, onBack, onNavigate, onEditActivity }) => {
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [attendeesRes, activitiesRes] = await Promise.all([
                supabase
                    .from('event_registrations')
                    .select(`
                        status,
                        profiles (id, full_name, email, registration_number, avatar_url, user_type)
                    `)
                    .eq('event_id', event.id),
                supabase
                    .from('activities')
                    .select('*')
                    .eq('event_id', event.id)
                    .order('start_time', { ascending: true })
            ]);

            if (attendeesRes.error) throw attendeesRes.error;
            if (activitiesRes.error) throw activitiesRes.error;

            const mappedAttendees = attendeesRes.data
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
            setActivities(activitiesRes.data as Activity[]);

        } catch (e: any) {
            console.error("ERRO SUPABASE:", e.message);
            setError("Não foi possível carregar os dados do evento.");
        } finally {
            setLoading(false);
        }
    }, [event.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleDeleteActivity = async (activityId: number) => {
        if (window.confirm("Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.")) {
            const { error: deleteError } = await supabase
                .from('activities')
                .delete()
                .match({ id: activityId });
            
            if (deleteError) {
                alert(`Erro ao excluir atividade: ${deleteError.message}`);
            } else {
                setActivities(prev => prev.filter(a => a.id !== activityId));
            }
        }
    };

    const handlePresenceChange = async (attendee: Attendee, isPresent: boolean) => {
        const newStatus = isPresent ? 'Present' : 'Absent';
        
        setAttendees(prev => prev.map(att => 
            att.user_id === attendee.user_id ? { ...att, status: newStatus } : att
        ));
        
        const { error: updateError } = await supabase
            .from('event_registrations')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .match({ event_id: event.id, user_id: attendee.user_id });
        
        if (updateError) {
            console.error('Failed to update presence:', updateError);
            setAttendees(prev => prev.map(att => 
                att.user_id === attendee.user_id ? { ...att, status: attendee.status } : att
            ));
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
                <div className="text-center p-8 text-gray-500">
                    <p>Nenhuma atividade interna cadastrada.</p>
                </div>
            )
        }
        return (
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none">
                {activities.map((activity, index) => (
                    <div key={activity.id} className={`flex items-center p-4 ${index < activities.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/50' : ''}`}>
                         <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon name="layout" className="w-6 h-6 text-ifal-green" />
                        </div>
                        <div className="flex-1 ml-4 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{activity.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                            </p>
                        </div>
                        {activity.generates_certificate && (
                            <div className="ml-2 flex-shrink-0" title="Gera Certificado">
                                <Icon name="star_fill" className="w-5 h-5 text-yellow-500" />
                            </div>
                        )}
                        <div className="flex items-center space-x-1 ml-4">
                            <button onClick={() => onEditActivity(activity)} className="p-2 text-gray-400 hover:text-blue-500"><Icon name="pencil" className="w-5 h-5"/></button>
                            <button onClick={() => handleDeleteActivity(activity.id)} className="p-2 text-gray-400 hover:text-red-500"><Icon name="trash" className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderAttendees = () => {
        if (attendees.length === 0) {
            return (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <Icon name="users-group" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold">Nenhum Inscrito</h3>
                    <p>Compartilhe seu evento para receber inscrições.</p>
                </div>
            );
        }
        return (
            <div>
                 <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="search" className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                        type="text"
                        placeholder="Pesquisar por nome ou matrícula..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-200/70 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ifal-green"
                    />
                </div>
                 <h2 className="px-4 pb-2 text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                    {filteredAttendees.length} / {attendees.length} Inscritos
                 </h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none">
                    {filteredAttendees.map((attendee, index) => (
                        <div key={attendee.user_id} className={`flex items-center p-3 ${index < filteredAttendees.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/50' : ''}`}>
                            {attendee.avatar_url ? (
                                <img src={attendee.avatar_url} alt={attendee.name} className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-ifal-green flex-shrink-0">
                                    {getInitials(attendee.name)}
                                </div>
                            )}
                            <div className="flex-1 ml-4 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{attendee.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{attendee.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
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
                    <button onClick={fetchData} className="mt-6 bg-ifal-green text-white font-semibold py-2 px-6 rounded-xl">
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                <div>
                     <h2 className="px-2 pb-2 text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">Programação do Evento</h2>
                     {renderActivities()}
                </div>
                <div>
                     {renderAttendees()}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#F2F2F7] dark:bg-black min-h-screen pb-24">
            <PageHeader title="Gerenciar Evento" onBack={onBack} />
            
            <main className="p-4">
                <div className="px-2 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{event.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-semibold">{presentCount} de {attendees.length} presentes</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 px-2">
                    <button
                        onClick={() => onNavigate('Adicionar Atividade')}
                        className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                        <span>Adicionar Atividade</span>
                    </button>
                    <button
                         onClick={() => onNavigate('Escanear Credencial')}
                         className="w-full bg-gray-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-600 transition-colors"
                    >
                         <Icon name="qrcode" className="w-5 h-5" />
                        <span>Credenciamento</span>
                    </button>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

export default ManageAttendeesScreen;