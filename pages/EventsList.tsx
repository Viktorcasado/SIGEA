
import React, { useState } from 'react';
import EventCard from '../components/EventCard';
import { Event } from '../types';

interface EventsListProps {
  navigateTo: (page: string, id?: string) => void;
  events: Event[];
}

const EventsList: React.FC<EventsListProps> = ({ navigateTo, events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todos');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.campus.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'Todos') return matchesSearch;
    if (filter === 'Esta Semana') return matchesSearch; // Simulação
    if (filter === 'Estudantes') return matchesSearch && event.type === 'Workshop'; // Simulação
    if (filter === 'Online') return matchesSearch && event.location.toLowerCase().includes('online');

    return matchesSearch;
  });

  return (
    <div className="flex flex-col w-full pb-36 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-black">Eventos Disponíveis</h1>
        <p className="text-xs text-gray-500 font-medium">Descubra e participe de eventos no IFAL</p>
      </header>

      <main className="p-4 space-y-6">
        <div className="relative w-full">
          <input
            type="text"
            className="w-full p-4 pl-12 bg-white dark:bg-surface-dark border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm"
            placeholder="Pesquisar por nome ou campus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
        </div>

        {/* Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['Todos', 'Esta Semana', 'Estudantes', 'Online'].map((label) => (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`shrink-0 h-9 px-5 rounded-full text-xs font-bold transition-all ${filter === label ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex flex-col gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard key={event.id} event={event} onClick={() => navigateTo('details', event.id)} />
            ))
          ) : (
            <div className="py-20 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum evento encontrado com esses filtros.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventsList;
