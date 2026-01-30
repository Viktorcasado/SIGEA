import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Event } from '../types';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import EventCard from '../components/EventCard';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FloatingActionButton from '../components/FloatingActionButton';
import AIAssistantModal from '../components/AIAssistantModal';

const HomeScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true })
          .limit(5);
        
        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="pb-10 animate-fade">
      <Header onNavigate={(target) => navigate(target === 'Editar Perfil' ? '/perfil/editar' : '/')} />
      <SearchBar />

      <div className="px-6 mb-8">
        <h2 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Destaques da Semana</h2>
        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide snap-x">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="min-w-[280px] h-96 bg-gray-200 dark:bg-gray-800 rounded-[28px] animate-pulse"></div>)
          ) : (
            events.map(event => (
              <div key={event.id} className="snap-center">
                <EventCard 
                  event={event} 
                  onClick={() => navigate(`/eventos`)} 
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Próximos Eventos</h2>
          <button onClick={() => navigate('/eventos')} className="text-ifal-green text-[10px] font-black uppercase tracking-widest">Ver Todos</button>
        </div>
        
        <div className="space-y-4">
          {events.slice(0, 3).map(event => (
            <button 
              key={event.id} 
              onClick={() => navigate('/eventos')}
              className="w-full bg-white dark:bg-gray-800 p-5 rounded-[24px] border border-black/5 dark:border-white/5 flex items-center space-x-4 transition-all active:scale-[0.98] text-left"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden flex-shrink-0">
                {event.banner_url ? (
                  <img src={event.banner_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-ifal-green/20 flex items-center justify-center"><Icon name="calendar" className="text-ifal-green w-6 h-6" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate leading-tight">{event.title}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{new Date(event.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <Icon name="chevron-right" className="w-5 h-5 text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      <FloatingActionButton onClick={() => setIsAIModalOpen(true)} />
      <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
};

export default HomeScreen;