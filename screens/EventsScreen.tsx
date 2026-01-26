import React, { useState, useEffect, useCallback } from 'react';
import { Event } from '../types';
import FullEventCard from '../components/FullEventCard';
import Icon from '../components/Icon';
import { supabase } from '../services/supabaseClient';
import MainHeader from '../components/MainHeader';

interface EventsScreenProps {
  onSelectEvent: (event: Event) => void;
  onNavigate: (screen: string) => void;
}

const EventsScreen: React.FC<EventsScreenProps> = ({ onSelectEvent, onNavigate }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('events')
        .select('*');

      if (dbError) throw dbError;

      console.log("Dados recebidos:", data); // TESTE DE CONEXÃO

      // Supabase returns snake_case, but our Event type uses camelCase for some props
      const mappedEvents: Event[] = data.map((event: any) => ({
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
      }));

      setEvents(mappedEvents);

    } catch (e: any) {
      console.error(`ERRO SUPABASE: ${e.message}`);
      if (e.message && e.message.toLowerCase().includes('column') && e.message.toLowerCase().includes('not found')) {
          setError("Atualizando sistema... Tente novamente.");
      } else {
          setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ifal-green"></div>
        </div>
      );
    }

    if (error) {
      if (error.startsWith("Atualizando sistema")) {
        return (
            <div className="text-center py-16 px-4">
                <Icon name="robot" className="w-16 h-16 mx-auto mb-4 text-ifal-green" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Atualizando Sistema</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                    Estamos fazendo melhorias. Por favor, tente novamente em alguns instantes.
                </p>
                <button
                    onClick={fetchEvents}
                    className="mt-6 bg-ifal-green text-white font-semibold py-2 px-6 rounded-xl hover:bg-emerald-600 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
      }
      return (
        <div className="text-center py-16 px-4">
          <Icon name="life-buoy" className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Ocorreu um Erro</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Não foi possível carregar a lista de eventos. Tente novamente.
          </p>
          <div className="mt-2 text-xs text-red-400 dark:text-red-500/80 px-4 py-2 bg-red-500/10 rounded-md max-w-sm mx-auto text-left break-words">
             <b>Detalhes técnicos: </b>{error}
          </div>
          <button
            onClick={fetchEvents}
            className="mt-6 bg-ifal-green text-white font-semibold py-2 px-6 rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                {/* FIX: The 'compass' icon was removed. Replaced with 'search' for the "not found" state. */}
                <Icon name="search" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold">Nenhum Evento Encontrado</h3>
                <p>Nenhum evento disponível no momento.</p>
            </div>
        );
    }

    return (
      <div className="space-y-6">
        {events.map(event => (
          <FullEventCard key={event.id} event={event} onClick={() => onSelectEvent(event)} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <MainHeader onNavigate={onNavigate} />
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wider">TODOS OS EVENTOS</h2>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default EventsScreen;
