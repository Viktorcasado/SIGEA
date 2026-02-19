import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { mockEvents } from '@/src/data/mock';
import { Event } from '@/src/types';
import EventCard from '@/src/components/EventCard';

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
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
    let events = mockEvents;

    if (showFavorites) {
        events = events.filter(event => favorites.has(event.id));
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      events = events.filter(
        event =>
          event.titulo.toLowerCase().includes(lowercasedTerm) ||
          event.campus.toLowerCase().includes(lowercasedTerm) ||
          event.modalidade.toLowerCase().includes(lowercasedTerm)
      );
    }

    return events;
  }, [searchTerm, showFavorites, favorites]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const debouncedSearch = useMemo(() => debounce(handleSearchChange, 300), []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Explorar</h1>
        <p className="text-gray-500 mt-1">Encontre eventos no IFAL, UFAL e comunidade</p>
      </header>

      <div className="sticky top-4 z-10 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 py-3">
        <div className="flex gap-2 items-center">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                type="text"
                placeholder="Buscar por nome, campus ou modalidade"
                onChange={debouncedSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
            </div>
            <button className="p-3 border border-gray-200 bg-white rounded-lg hover:bg-gray-100 transition">
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            </button>
        </div>
        <div className='mt-3'>
            <button 
                onClick={() => setShowFavorites(!showFavorites)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center transition-colors ${showFavorites ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
                <Star className={`w-4 h-4 mr-2 ${showFavorites ? 'text-yellow-300' : 'text-gray-500'}`} />
                Favoritos
            </button>
        </div>
      </div>

      <main>
        {isLoading ? (
            <p>Carregando...</p> // Placeholder for skeleton loader
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                variant="list" 
                isFavorite={favorites.has(event.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700">Nenhum evento encontrado</h3>
            <p className="text-gray-500 mt-2">Tente ajustar sua busca ou filtros.</p>
          </div>
        )}
      </main>
    </div>
  );
}
