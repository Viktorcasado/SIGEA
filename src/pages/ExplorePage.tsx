"use client";

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/src/integrations/supabase/client';
import { Event } from '@/src/types';
import EventCard from '@/src/components/EventCard';
import { motion, AnimatePresence } from 'motion/react';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (!error && data) {
        const formattedEvents: Event[] = data.map(e => ({
          id: e.id,
          titulo: e.title,
          descricao: e.description || '',
          dataInicio: new Date(e.date),
          local: e.location || '',
          campus: e.campus || '',
          instituicao: 'IFAL',
          modalidade: 'Presencial',
          status: 'publicado',
          vagas: e.workload || 0
        }));
        setEvents(formattedEvents);
      }
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(eventId)) {
        newFavs.delete(eventId);
      } else {
        newFavs.add(eventId);
      }
      return newFavs;
    });
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (showFavorites) {
      filtered = filtered.filter(event => favorites.has(event.id));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.titulo.toLowerCase().includes(term) ||
          event.campus.toLowerCase().includes(term) ||
          event.descricao.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [searchTerm, showFavorites, favorites, events]);

  return (
    <div className="space-y-6 pb-12">
      <header>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Explorar</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Encontre eventos acadêmicos e profissionais</p>
      </header>

      <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md -mx-4 px-4 py-4 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou campus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          <button className="p-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
            <SlidersHorizontal className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFavorites(!showFavorites)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              showFavorites 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Star className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
            Favoritos ({favorites.size})
          </button>
        </div>
      </div>

      <main>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">Buscando eventos...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EventCard 
                    event={event} 
                    variant="list" 
                    isFavorite={favorites.has(event.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800"
          >
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300 dark:text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Nenhum evento encontrado</h3>
            <p className="text-gray-500 dark:text-gray-500 mt-2 max-w-xs mx-auto">Tente ajustar sua busca ou remover os filtros aplicados.</p>
            {(searchTerm || showFavorites) && (
              <button 
                onClick={() => { setSearchTerm(''); setShowFavorites(false); }}
                className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}