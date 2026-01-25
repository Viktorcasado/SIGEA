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
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const fetchOrganizerEvents = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        setDeleteError(null); // Limpa erros de exclusão anteriores ao recarregar
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
        setDeleteError(null); // Limpa erros anteriores
        if (window.confirm("Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.")) {
            const { error: deleteError } = await supabase
                .from('events')
                .delete()
                .match({ id: eventId });
            
            if (deleteError) {
                setDeleteError(`Erro ao excluir o evento: ${deleteError.message}`);
            } else {
                setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            }
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
                    <button onClick={fetchOrganizerEvents} className="mt-6 bg-ifal-green text-white font-semibold py-2 px-6 rounded-xl">
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        if (events.length === 0) {
            return (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    <Icon name="calendar" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold">Nenhum Evento Criado</h3>
                    <p className="mb-6">Comece a organizar agora mesmo.</p>
                    <button
                        onClick={() => onNavigate('Criar Novo Evento')}
                        className="bg-ifal-green text-white font-semibold py-3 px-8 rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                        Criar meu primeiro evento
                    </button>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none">
                {events.map((event, index) => (
                    <div key={event.id} className={`flex items-center justify-between p-4 ${index < events.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/50' : ''}`}>
                        <button
                            onClick={() => onSelectEvent(event)}
                            className="flex-1 min-w-0 text-left"
                        >
                            <p className="text-gray-900 dark:text-gray-100 font-semibold truncate">{event.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {event.event_registrations[0]?.count ?? 0} Inscritos
                            </p>
                        </button>
                        <div className="flex items-center space-x-2 ml-4">
                            <button onClick={() => onEditEvent(event)} className="p-2 text-gray-400 hover:text-blue-500"><Icon name="pencil" className="w-5 h-5"/></button>
                            <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500"><Icon name="trash" className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-[#F2F2F7] dark:bg-black min-h-screen">
            <header className="sticky top-0 z-10 p-6 pt-12 flex justify-between items-center bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Painel de Controle
                    </h1>
                </div>
                <button
                    onClick={() => onNavigate('Criar Novo Evento')}
                    className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-ifal-green active:scale-90 transition-transform"
                    aria-label="Criar Novo Evento"
                >
                    <Icon name="plus" className="w-7 h-7" />
                </button>
            </header>

            <main className="p-4">
                <h2 className="px-4 pb-2 text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">Meus Eventos</h2>
                 {deleteError && (
                    <div className="mx-4 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {deleteError}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboardScreen;