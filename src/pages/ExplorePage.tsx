"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Star, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/src/integrations/supabase/client';
import { Event } from '@/src/types';
import EventCard from '@/src/components/EventCard';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['Todos', 'Tecnologia', 'Saúde', 'Educação', 'Cultura', 'Esporte', 'Gestão'];

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (supabaseError) throw supabaseError;

      const formattedEvents: Event[] = (data || []).map(e => ({
        id: e.id,
        titulo: e.title,
        descricao: e.description || '',
        dataInicio: new Date(e.date),
        local: e.location || '',
        campus: e.campus || '',
        instituicao: 'IFAL',
        modalidade: 'Presencial',
        status: 'publicado',
        vagas: e.workload || 0,
        carga_horaria: e.workload || 0,
        category: e.category || 'Geral'
      }));
      setEvents(formattedEvents);
    } catch (err: any) {
      console.error("[ExplorePage] Erro ao buscar eventos:", err);
      setError("Não foi possível carregar os eventos. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez na montagem

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

    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(event => (event as any).category === selectedCategory);
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
  }, [searchTerm, showFavorites, favorites, events, selectedCategory]);

  return (
    <div className="space-y-6 pb-12">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Explorar</h1>
        <p className="text-gray-500 mt-1 font-medium">Descubra oportunidades e eventos incríveis.</p>
      </header>

      <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-xl -mx-4 px-4 py-4 space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, campus ou tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-gray-900 font-medium"
            />
          </div>
          <button className="p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm group">
            <SlidersHorizontal className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setShowFavorites(!showFavorites)}
            className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              showFavorites 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-200'
            }`}
          >
            <Star className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
            Favoritos
          </button>
          <div className="w-px h-8 bg-gray-200 mx-1 shrink-0 self-center" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="font-bold text-gray-500">Sincronizando eventos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">{error}</h3>
            <button onClick={fetchEvents} className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">Tentar novamente</button>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
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
            className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-800">Nada por aqui</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto font-medium">Não encontramos eventos que correspondam aos seus filtros atuais.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); setShowFavorites(false); }}
              className="mt-8 text-indigo-600 font-black hover:underline uppercase tracking-widest text-xs"
            >
              Limpar todos os filtros
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}