
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, Attendee, UserType, Activity } from '../types';
import Icon from '../components/Icon';
import PageHeader from '../components/PageHeader';
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

type MainTab = 'dashboard' | 'attendees' | 'programacao' | 'certificates' | 'settings';

const ManageAttendeesScreen: React.FC<ManageAttendeesScreenProps> = ({ event, onBack, onNavigate, onEditActivity, onEditEvent, isDesktop }) => {
    const [activeTab, setActiveTab] = useState<MainTab>(() => {
        const params = new URLSearchParams(window.location.search);
        return (params.get('tab') as MainTab) || 'dashboard';
    });
    
    const [subTab, setSubTab] = useState<string>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('sub') || 'lista';
    });

    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
    const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab);
        url.searchParams.set('sub', subTab);
        window.history.replaceState({}, '', url.toString());
    }, [activeTab, subTab]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [attendeesRes, activitiesRes] = await Promise.all([
                supabase.from('event_registrations').select('status, profiles(*)').eq('event_id', event.id),
                supabase.from('activities').select('*, activity_registrations(count)').eq('event_id', event.id).order('start_time', { ascending: true })
            ]);

            if (attendeesRes.data) {
                setAttendees(attendeesRes.data.map((reg: any) => ({
                    user_id: reg.profiles.id,
                    id: reg.profiles.registration_number || reg.profiles.id,
                    name: reg.profiles.full_name,
                    status: reg.status === 'Present' ? 'Present' : 'Absent',
                    user_type: reg.profiles.user_type,
                    email: reg.profiles.email
                })));
            }
            
            if (activitiesRes.data) {
                const mappedActivities = activitiesRes.data.map((act: any) => ({
                    ...act,
                    registration_count: act.activity_registrations?.[0]?.count || 0,
                    max_slots: act.max_slots || 50
                }));
                setActivities(mappedActivities as Activity[]);
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
            // Invoca a Edge Function do Supabase para processar os e-mails e certificados
            // Conforme o snippet fornecido: supabase.functions.invoke('send-certificates', body: {'event_id': widget.eventId});
            const { data, error } = await supabase.functions.invoke('send-certificates', {
                body: { event_id: event.id }
            });

            if (error) throw error;

            if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 5000);
        } catch (err: any) {
            console.error("Erro ao liberar certificados:", err);
            alert(`Erro no processamento: ${err.message || "Tente novamente mais tarde."}`);
        } finally {
            setIsReleasing(false);
        }
    };

    const handleExportCSV = () => {
        if (attendees.length === 0) return;
        setIsExporting(true);
        try {
            exportAttendeesToCSV(attendees, event.title);
            if (navigator.vibrate) navigator.vibrate(10);
        } catch (err) {
            console.error("Erro ao exportar CSV:", err);
            alert("Não foi possível gerar a planilha.");
        } finally {
            setIsExporting(false);
        }
    };

    const TabButton: React.FC<{ id: MainTab, label: string, icon: any }> = ({ id, label, icon }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                if (id === 'programacao') setSubTab('lista');
                if (id === 'certificates') setSubTab('modelo');
            }}
            className={`flex items-center space-x-2 px-6 py-4 text-[13px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === id ? 'text-ifal-green' : 'text-gray-400 hover:text-gray-600'
            }`}
        >
            <Icon name={icon} className="w-4 h-4" />
            <span>{label}</span>
            {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-ifal-green rounded-t-full" />}
        </button>
    );

    const SubTabButton: React.FC<{ id: string, label: string }> = ({ id, label }) => (
        <button
            onClick={() => setSubTab(id)}
            className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-all ${
                subTab === id ? 'bg-ifal-green text-white shadow-lg shadow-ifal-green/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
        >
            {label}
        </button>
    );

    const renderCertificates = () => {
        const eligibleCount = attendees.filter(a => a.status === 'Present').length;
        const totalCount = attendees.length;
        
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center space-x-2 bg-white dark:bg-[#1C1C1E] p-1.5 rounded-full border border-black/5 w-fit">
                    <SubTabButton id="modelo" label="Modelo (Design)" />
                    <SubTabButton id="emissao" label="Liberação em Lote" />
                </div>

                {subTab === 'modelo' && (
                    <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-black/5 shadow-sm">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Editor de Posicionamento</h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">Arraste a tag de nome para configurar o local de impressão automática</p>
                        </div>
                        <div className="max-w-4xl mx-auto">
                            <CertificateTemplateEditor event={event} />
                        </div>
                    </div>
                )}

                {subTab === 'emissao' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white dark:bg-[#1C1C1E] p-10 rounded-[40px] border border-black/5 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-ifal-green/5 rounded-bl-[100px]" />
                                
                                <div className="flex items-center space-x-5 mb-10">
                                    <div className="w-16 h-16 bg-ifal-green text-white rounded-3xl flex items-center justify-center shadow-xl shadow-ifal-green/20">
                                        <Icon name="star" className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Emissão Institucional</h3>
                                        <p className="text-[10px] text-ifal-green font-black uppercase tracking-[0.2em] mt-1">Status: Pronto para Processamento</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6 mb-12">
                                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                        Este módulo automatizado realiza a homologação final dos certificados. O sistema irá gerar um código de autenticidade único para cada aluno e enviará o documento em PDF para o e-mail cadastrado.
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-black/5">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Elegíveis (Presentes)</span>
                                            <span className="text-3xl font-black text-ifal-green tracking-tighter">{eligibleCount}</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-black/5">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Total Inscritos</span>
                                            <span className="text-3xl font-black text-gray-300 tracking-tighter">{totalCount}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setShowReleaseConfirm(true)}
                                    disabled={isReleasing || eligibleCount === 0}
                                    className="w-full bg-ifal-green text-white font-black py-6 rounded-[28px] text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-ifal-green/30 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center space-x-4"
                                >
                                    {isReleasing ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Iniciando Disparo...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="check" className="w-5 h-5" />
                                            <span>Liberar Certificados Gratuitos</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[32px] flex items-center space-x-4">
                                <Icon name="shield" className="w-6 h-6 text-blue-500" />
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                    Segurança: O processamento em lote é irreversível e gera registros de auditoria no SIGEA.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[40px] border border-black/5 shadow-sm h-full">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Resumo da Edge Function</h4>
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                                        <p className="text-sm text-gray-600 font-medium">Filtro de participantes com 100% de frequência confirmada.</p>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                                        <p className="text-sm text-gray-600 font-medium">Geração de PDF baseado no banner institucional do evento.</p>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                                        <p className="text-sm text-gray-600 font-medium">Disparo de e-mail via servidor SMTP seguro para {eligibleCount} destinatários.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F8FA] dark:bg-black">
            <div className="w-12 h-12 border-4 border-ifal-green border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Sincronizando SIGEA Cloud</p>
        </div>
    );

    const presentCount = attendees.filter(a => a.status === 'Present').length;
    const presenceRate = attendees.length > 0 ? Math.round((presentCount / attendees.length) * 100) : 0;

    return (
        <div className="bg-[#F8F8FA] dark:bg-black min-h-screen">
            <header className="bg-white dark:bg-[#111] border-b border-black/5 sticky top-0 z-40 backdrop-blur-3xl bg-white/80 dark:bg-black/80">
                <div className="px-8 pt-8 pb-0 max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-6">
                            <button onClick={onBack} className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-ifal-green hover:text-white transition-all active:scale-90">
                                <Icon name="arrow-left" className="w-5 h-5"/>
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-1">Painel Administrativo</h1>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.title}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                             <div className="hidden md:flex flex-col items-end mr-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organizador</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">PROEX / IFAL</span>
                             </div>
                             <div className="w-12 h-12 bg-ifal-green/10 text-ifal-green rounded-2xl flex items-center justify-center">
                                <Icon name="shield" className="w-6 h-6" />
                             </div>
                        </div>
                    </div>
                    <nav className="flex space-x-2">
                        <TabButton id="dashboard" label="Visão Geral" icon="layout" />
                        <TabButton id="attendees" label="Participantes" icon="users" />
                        <TabButton id="programacao" label="Cronograma" icon="calendar" />
                        <TabButton id="certificates" label="Emissão" icon="star" />
                        <TabButton id="settings" label="Ajustes" icon="shield" />
                    </nav>
                </div>
            </header>

            <main className="p-8 max-w-[1400px] mx-auto pb-40">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                        <StatCard label="Público Alvo" value={attendees.length} icon="users" trend="+4.2%" />
                        <StatCard label="Grade Horária" value={`${activities.length} Ativ.`} icon="clock" color="text-blue-500" bgColor="bg-blue-500/10" />
                        <StatCard label="Presenças" value={presentCount} icon="check" color="text-purple-500" bgColor="bg-purple-500/10" />
                        <StatCard label="Conversão" value={`${presenceRate}%`} icon="bar-chart" color="text-orange-500" bgColor="bg-orange-500/10" trend="Check-in" />
                    </div>
                )}

                {activeTab === 'certificates' && renderCertificates()}
                
                {activeTab === 'attendees' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center bg-white dark:bg-[#1C1C1E] p-4 rounded-[32px] border border-black/5 shadow-sm">
                            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-black/20 p-1.5 rounded-full">
                                <SubTabButton id="lista" label="Inscritos" />
                                <SubTabButton id="presenca" label="Chamada" />
                            </div>
                            <button 
                                onClick={handleExportCSV}
                                disabled={isExporting || attendees.length === 0}
                                className="bg-ifal-green text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center space-x-3 shadow-xl shadow-ifal-green/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icon name="arrows-outward" className="w-4 h-4" />}
                                <span>Exportar Planilha (.CSV)</span>
                            </button>
                        </div>

                        <div className="bg-white dark:bg-[#1C1C1E] rounded-[40px] border border-black/5 overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-black/5 flex items-center bg-gray-50/50 dark:bg-white/2">
                                <Icon name="search" className="w-5 h-5 text-gray-300 mr-4" />
                                <input 
                                    type="text" 
                                    placeholder="Pesquisar por nome, CPF ou matrícula..." 
                                    className="bg-transparent outline-none text-base w-full font-bold text-gray-700 dark:text-gray-300 placeholder-gray-300" 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            <div className="divide-y divide-black/5">
                                {attendees.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map((att) => (
                                    <div key={att.user_id} className="flex items-center p-6 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors group">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center font-black text-gray-500 text-sm group-hover:bg-ifal-green group-hover:text-white transition-colors">
                                            {att.name[0]}
                                        </div>
                                        <div className="ml-5 flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{att.name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{att.id} • {att.user_type}</p>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="hidden sm:block text-right">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">E-mail</p>
                                                <p className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{att.email || 'N/A'}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-2 ${att.status === 'Present' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {att.status === 'Present' ? 'Presente' : 'Faltoso'}
                                                </span>
                                                <ToggleSwitch enabled={att.status === 'Present'} setEnabled={() => {}} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {attendees.length === 0 && (
                                    <div className="p-32 text-center">
                                        <Icon name="users" className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                        <p className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.3em]">Nenhum participante encontrado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Sucesso Toast Cupertino Style */}
            <div className={`fixed top-12 left-1/2 -translate-x-1/2 bg-black/90 dark:bg-white text-white dark:text-black px-10 py-5 rounded-[24px] text-sm font-black uppercase tracking-widest shadow-2xl transition-all duration-500 z-[100] flex items-center space-x-4 backdrop-blur-xl ${showSuccessToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
                <div className="w-6 h-6 bg-ifal-green text-white rounded-full flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4" />
                </div>
                <span>Processamento de e-mails iniciado com sucesso!</span>
            </div>

            <AlertDialog 
                isOpen={showReleaseConfirm} 
                title="Confirmar Emissão Gratuita?" 
                content={`Você está prestes a liberar certificados para ${presentCount} participantes com presença confirmada. Esta ação disparará e-mails automáticos e não pode ser revertida.`} 
                actions={[
                    { label: 'Cancelar', onClick: () => setShowReleaseConfirm(false) },
                    { label: 'Confirmar e Enviar', onClick: handleReleaseCertificates }
                ]} 
            />

            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ManageAttendeesScreen;
