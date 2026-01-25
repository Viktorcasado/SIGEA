import React, { useState, useEffect, useCallback } from 'react';
import { Event } from '../types';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';

interface AdminDashboardScreenProps {
  onSelectEvent: (event: Event) => void;
  onNavigate: (screen: string) => void;
  onEditEvent: (event: Event) => void;
}

interface EventWithCount extends Event {
    event_registrations: { count: number }[];
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onSelectEvent, onNavigate, onEditEvent }) => {
    const { user } = useUser();
    const [events, setEvents] = useState<EventWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const fetchOrganizerEvents = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: dbError } = await supabase
                .from('events')
                .select('*, event_registrations(count)')
                .eq('organizer_id', user.id)
                .order('date', { ascending: false });

            if (dbError) throw dbError;
            
            const mappedEvents: EventWithCount[] = data.map((event: any) => ({
                id: event.id,
                category: event.category,
                date: event.date,
                title: event.title,
                location: event.location,
                imageUrl: event.image_url,
                hours: event.workload,
                speakers: event.speakers,
                description: event.description,
                document_url: event.document_url,
                event_registrations: event.event_registrations,
            }));

            setEvents(mappedEvents);
        } catch (err: any) {
            console.error("Failed to fetch organizer events:", err);
            setError("Não foi possível carregar seus eventos gerenciados.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchOrganizerEvents();
    }, [fetchOrganizerEvents]);

    const handleDelete = async (eventId: number) => {
        if (window.confirm("Atenção! Isso excluirá o evento e todas as inscrições permanentemente. Continuar?")) {
            setIsDeleting(eventId);
            const { error: deleteError } = await supabase
                .from('events')
                .delete()
                .match({ id: eventId });
            
            if (deleteError) {
                alert(`Erro ao excluir: ${deleteError.message}`);
                setIsDeleting(null);
            } else {
                if (navigator.vibrate) navigator.vibrate(50);
                setEvents(prev => prev.filter(e => e.id !== eventId));
                setIsDeleting(null);
            }
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ifal-green"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sincronizando Banco de Dados</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-[32px] border border-red-100 shadow-xl">
                    <Icon name="life-buoy" className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Ops! Algo falhou</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{error}</p>
                    <button onClick={fetchOrganizerEvents} className="mt-8 bg-ifal-green text-white font-black py-4 px-10 rounded-full text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-ifal-green/30">
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        if (events.length === 0) {
            return (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 flex flex-col items-center animate-fade-in">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Icon name="calendar" className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Nenhum Evento Ativo</h3>
                    <p className="mt-2 mb-8 text-sm px-10">Você ainda não criou eventos para gerenciar. Comece agora!</p>
                    <button
                        onClick={() => onNavigate('Criar Novo Evento')}
                        className="bg-ifal-green text-white font-black py-4 px-10 rounded-[20px] shadow-xl shadow-ifal-green/30 active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                        Criar meu primeiro evento
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-4 pb-20">
                {events.map((event) => (
                    <div key={event.id} className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 shadow-sm border border-black/5 dark:border-white/5 animate-scale-up">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 min-w-0 pr-4" onClick={() => onSelectEvent(event)}>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ifal-green mb-1 block">
                                    {event.category}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
                                    {event.title}
                                </h3>
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => onEditEvent(event)} 
                                    className="w-11 h-11 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center active:scale-90 transition-all"
                                    title="Editar evento"
                                >
                                    <Icon name="pencil" className="w-5 h-5"/>
                                </button>
                                <button 
                                    onClick={() => handleDelete(event.id)}
                                    disabled={isDeleting === event.id}
                                    className="w-11 h-11 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
                                    title="Excluir evento"
                                >
                                    {isDeleting === event.id ? (
                                        <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                                    ) : (
                                        <Icon name="trash" className="w-5 h-5"/>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5" onClick={() => onSelectEvent(event)}>
                            <div className="flex items-center space-x-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Total Inscritos</span>
                                    <span className="text-lg font-black text-gray-900 dark:text-white">
                                        {event.event_registrations[0]?.count ?? 0}
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-black/5 dark:border-white/5"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Carga Horária</span>
                                    <span className="text-lg font-black text-gray-900 dark:text-white">
                                        {event.hours}h
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                                <Icon name="chevron-right" className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-[#F2F2F7] dark:bg-black min-h-screen font-sans">
            <header className="sticky top-0 z-10 px-6 pt-12 pb-6 flex justify-between items-center bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                        Gestão
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Painel do Organizador</p>
                </div>
                <button
                    onClick={() => onNavigate('Criar Novo Evento')}
                    className="w-14 h-14 bg-ifal-green text-white rounded-[20px] flex items-center justify-center shadow-2xl shadow-ifal-green/40 active:scale-90 transition-all"
                    aria-label="Criar Novo Evento"
                >
                    <Icon name="plus" className="w-8 h-8" />
                </button>
            </header>

            <main className="p-6">
                {renderContent()}
            </main>

            <style>{`
                .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default AdminDashboardScreen;