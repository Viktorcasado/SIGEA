import React, { useState, useEffect, useCallback } from 'react';
import MainHeader from '../components/MainHeader';
import SearchBar from '../components/SearchBar';
import EventCard from '../components/EventCard';
import { Event } from '../types';
import Icon from '../components/Icon';
import { supabase } from '../services/supabaseClient';

interface HomeScreenProps {
  onSelectEvent: (event: Event) => void;
  onNavigate: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectEvent, onNavigate }) => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Consumindo dados reais da tabela 'events'
      const { data, error: dbError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(5);

      if (dbError) throw dbError;

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

      setFeaturedEvents(mappedEvents);

    } catch (e: any) {
      console.error("ERRO SUPABASE:", e.message);
      setError("Falha ao sincronizar com o servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedEvents();
  }, [fetchFeaturedEvents]);

  const renderFeaturedContent = () => {
    if (loading) {
      return (
        <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide">
            {[1, 2, 3].map(i => (
                <div key={i} className="w-72 h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse flex-shrink-0" />
            ))}
        </div>
      );
    }

    if (error || featuredEvents.length === 0) {
        return (
            <div className="text-center h-80 flex flex-col justify-center items-center text-gray-500 pr-6">
                <Icon name="layout" className="w-12 h-12 mb-3 text-gray-300" />
                <h3 className="font-bold text-lg">Sem Destaques</h3>
                <p className="text-sm">Não há eventos agendados para este campus.</p>
                <button onClick={fetchFeaturedEvents} className="mt-4 text-ifal-green font-bold text-sm">Atualizar</button>
            </div>
        );
    }

    return (
      <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide">
        {featuredEvents.map(event => (
          <EventCard key={event.id} event={event} onClick={() => onSelectEvent(event)} />
        ))}
        <div className="w-2 flex-shrink-0"></div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <MainHeader title="SIGEA" onNavigate={onNavigate} />
      <SearchBar />
      <main className="pl-6">
        <div className="flex justify-between items-center pr-6 mb-4">
          <h2 className="text-[11px] font-extrabold tracking-[0.2em] text-gray-400 border-l-4 border-ifal-green pl-3 uppercase">Destaques Reais</h2>
          <button onClick={() => onNavigate('events')} className="text-xs font-bold text-ifal-green uppercase">Ver Tudo</button>
        </div>
        {renderFeaturedContent()}
      </main>
    </div>
  );
};

export default HomeScreen;