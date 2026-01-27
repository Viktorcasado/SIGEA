
import React, { useState, useEffect, useCallback } from 'react';
import { Event, Attendee, Activity } from '../types';
import Icon from '../components/Icon';
import { supabase } from '../services/supabaseClient';
import ToggleSwitch from '../components/ToggleSwitch';
import AlertDialog from '../components/AlertDialog';
import StatCard from '../components/StatCard';
import CertificateTemplateEditor from '../components/CertificateTemplateEditor';
import { exportAttendeesToCSV } from '../services/exportService';

interface ManageAttendeesScreenProps {
  event: Event;
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onEditActivity: (activity: Activity) => void;
  onEditEvent: (event: Event) => void;
  isDesktop: boolean;
}

type MainTab = 'dashboard' | 'attendees' | 'programacao' | 'certificates';

const ManageAttendeesScreen: React.FC<ManageAttendeesScreenProps> = ({ event, onBack, onNavigate, onEditActivity, onEditEvent, isDesktop }) => {
    const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReleasing, setIsReleasing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [attendeesRes, activitiesRes] = await Promise.all([
                supabase.from('event_registrations').select('status, profiles(*)').eq('event_id', event.id),
                supabase.from('activities').select('*, activity_registrations(count)').eq('event_id', event.id).order('start_time')
            ]);

            if (attendeesRes.data) {
                setAttendees(attendeesRes.data.map((reg: any) => ({
                    user_id: reg.profiles.id,
                    id: reg.profiles.registration_number || reg.profiles.id,
                    name: reg.profiles.full_name,
                    status: reg.status === 'Present' ? 'Present' : 'Absent',
                    user_type: reg.profiles.user_type,
                })));
            }
            
            if (activitiesRes.data) {
                setActivities(activitiesRes.data.map((act: any) => ({
                    ...act,
                    registration_count: act.activity_registrations?.[0]?.count || 0,
                    max_slots: act.max_slots || 50
                })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [event.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleReleaseCertificates = async () => {
        setIsReleasing(true);
        setShowReleaseConfirm(false);
        try {
            const { error } = await supabase.functions.invoke('send-certificates', {
                body: { event_id: event.id }
            });
            if (error) throw error;
            if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 5000);
        } catch (err) {
            console.error(err);
            alert("Erro ao disparar função de certificados. Verifique as Edge Functions.");
        } finally {
            setIsReleasing(false);
        }
    };

    const handleDeleteActivity = async () => {
        if (!activityToDelete) return;
        try {
            const { error } = await supabase.from('activities').delete().eq('id', activityToDelete.id);
            if (error) throw error;
            setActivities(prev => prev.filter(a => a.id !== activityToDelete.id));
            if (navigator.vibrate) navigator.vibrate(10);
        } catch (e) {
            alert("Erro ao excluir atividade");
        } finally {
            setActivityToDelete(null);
        }
    };

    const renderTabButton = (id: MainTab, label: string, icon: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex items-center space-x-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === id ? 'text-ifal-green' : 'text-gray-400'
            }`}
        >
            <Icon name={icon} className="w-4 h-4" />
            <span>{label}</span>
            {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-ifal-green rounded-t-full" />}
        </button>
    );

    const renderAttendeeItem = (att: Attendee) => (
        <div key={att.user_id} className="flex items-center p-5 bg-white dark:bg-[#1C1C1E] border border-black/5 rounded-3xl mb-3 shadow-sm">
            <div className="w-10 h-10 bg-ifal-green/10 text-ifal-green rounded-xl flex items-center justify-center font-black text-xs">
                {att.name.charAt(0)}
            </div>
            <div className="ml-4 flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{att.name}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{att.id} • {att.user_type}</p>
            </div>
            <div className="flex items-center space-x-2">
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${att.status === 'Present' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {att.status === 'Present' ? 'Check-in' : 'Ausente'}
                </span>
                <ToggleSwitch enabled={att.status === 'Present'} setEnabled={() => {}} />
            </div>
        </div>
    );

    const renderActivityItem = (act: Activity) => (
        <div key={act.id} className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] border border-black/5 mb-4 shadow-sm group">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${act.type === 'Palestra' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {act.type}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                            {new Date(act.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{act.title}</h4>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {act.location} • {act.hours}h
                    </p>
                </div>
                <div className="flex space-x-1">
                    <button 
                        onClick={() => onEditActivity(act)}
                        className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                    >
                        <Icon name="pencil" className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActivityToDelete(act)}
                        className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                    >
                        <Icon name="trash" className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8F8FA] dark:bg-black"><div className="w-10 h-10 border-b-2 border-ifal-green rounded-full animate-spin" /></div>;

    return (
        <div className="bg-[#F8F8FA] dark:bg-black min-h-screen">
            <header className="bg-white dark:bg-[#111] border-b border-black/5 sticky top-0 z-30 pt-4">
                <div className="px-6 flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button onClick={onBack} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                            <Icon name="arrow-left" className="w-5 h-5"/>
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight truncate">Gestão do Evento</h1>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">{event.title}</p>
                        </div>
                    </div>
                    {activeTab === 'programacao' && (
                        <button 
                            onClick={() => onNavigate('Adicionar Atividade')}
                            className="bg-ifal-green text-white p-3 rounded-2xl shadow-lg shadow-ifal-green/20 active:scale-90 transition-all"
                        >
                            <Icon name="plus" className="w-6 h-6" />
                        </button>
                    )}
                </div>
                <nav className="flex overflow-x-auto scrollbar-hide px-2">
                    {renderTabButton('dashboard', 'Painel', 'layout')}
                    {renderTabButton('attendees', 'Inscritos', 'users')}
                    {renderTabButton('programacao', 'Cronograma', 'calendar')}
                    {renderTabButton('certificates', 'Certificados', 'star')}
                </nav>
            </header>

            <main className="p-6">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-2 gap-4 animate-scale-up">
                        <StatCard label="Inscritos" value={attendees.length} icon="users" />
                        <StatCard label="Presenças" value={attendees.filter(a => a.status === 'Present').length} icon="check" color="text-blue-500" bgColor="bg-blue-500/10" />
                        <StatCard label="Atividades" value={activities.length} icon="calendar" color="text-purple-500" bgColor="bg-purple-500/10" />
                        <StatCard label="Check-in %" value={attendees.length > 0 ? `${Math.round((attendees.filter(a => a.status === 'Present').length / attendees.length) * 100)}%` : '0%'} icon="bar-chart" color="text-orange-500" bgColor="bg-orange-500/10" />
                    </div>
                )}

                {activeTab === 'attendees' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex bg-white dark:bg-[#1C1C1E] p-1.5 rounded-2xl border border-black/5 mb-4">
                            <input 
                                type="text" 
                                placeholder="Buscar participante..." 
                                className="bg-transparent flex-1 px-4 py-2 text-sm font-bold outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button onClick={() => exportAttendeesToCSV(attendees, event.title)} className="p-2 text-ifal-green"><Icon name="arrows-outward" /></button>
                        </div>
                        {attendees.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map(renderAttendeeItem)}
                        {attendees.length === 0 && (
                            <div className="py-20 text-center opacity-30">
                                <Icon name="users" className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase">Nenhum inscrito até o momento</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'programacao' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Lista de Atividades</h3>
                            <span className="text-[10px] font-black text-ifal-green uppercase">{activities.length} total</span>
                        </div>
                        {activities.map(renderActivityItem)}
                        {activities.length === 0 && (
                            <div className="py-20 text-center bg-white dark:bg-[#1C1C1E] rounded-[32px] border-2 border-dashed border-black/5">
                                <Icon name="calendar" className="w-10 h-10 mx-auto mb-4 text-gray-300" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhuma atividade no cronograma</p>
                                <button 
                                    onClick={() => onNavigate('Adicionar Atividade')}
                                    className="mt-4 text-ifal-green text-xs font-black uppercase tracking-widest"
                                >
                                    + Criar agora
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'certificates' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-black/5 shadow-xl text-center">
                            <div className="w-16 h-16 bg-ifal-green/10 text-ifal-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Icon name="star" className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Emissão Automática</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-8">Liberação para {attendees.filter(a => a.status === 'Present').length} participantes confirmados</p>
                            
                            <button 
                                onClick={() => setShowReleaseConfirm(true)}
                                disabled={isReleasing || attendees.filter(a => a.status === 'Present').length === 0}
                                className="w-full bg-ifal-green text-white font-black py-5 rounded-[22px] text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-40"
                            >
                                {isReleasing ? 'Enviando Lote...' : 'Liberar Certificados para Todos'}
                            </button>
                        </div>
                        
                        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px] border border-black/5">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Configuração do Layout</h4>
                            <CertificateTemplateEditor event={event} />
                        </div>
                    </div>
                )}
            </main>

            <AlertDialog 
                isOpen={showReleaseConfirm} 
                title="Confirmar Emissão?" 
                content="Esta ação enviará os certificados via e-mail para todos os alunos com check-in confirmado. Continuar?" 
                actions={[
                    { label: 'Cancelar', onClick: () => setShowReleaseConfirm(false) },
                    { label: 'Sim, liberar', onClick: handleReleaseCertificates }
                ]} 
            />

            <AlertDialog 
                isOpen={!!activityToDelete} 
                title="Excluir Atividade?" 
                content="Tem certeza que deseja remover esta atividade permanentemente? Esta ação não pode ser desfeita." 
                actions={[
                    { label: 'Cancelar', onClick: () => setActivityToDelete(null) },
                    { label: 'Excluir', isDestructive: true, onClick: handleDeleteActivity }
                ]} 
            />

            {showSuccessToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-ifal-green text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl animate-slide-up z-50">
                    Processamento iniciado com sucesso!
                </div>
            )}

            <style>{`
                .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default ManageAttendeesScreen;
