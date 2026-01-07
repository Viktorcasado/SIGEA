
import React, { useState, useMemo } from 'react';
import EventCard from '../components/EventCard';
import { Event } from '../types';

interface EventsListProps {
  navigateTo: (page: string, id?: string) => void;
  events: Event[];
}

const EventsList: React.FC<EventsListProps> = ({ navigateTo, events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedPeriod, setSelectedPeriod] = useState('Todos');

  const eventTypes = [
    { name: 'Todos', icon: 'grid_view' },
    { name: 'Workshop', icon: 'build' },
    { name: 'Palestra', icon: 'record_voice_over' }
  ];

  const periods = ['Todos', 'Hoje', 'Esta Semana', 'Este Mês'];

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'Todos' || event.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [events, searchTerm, selectedType]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-32 animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 space-y-8">
        <div>
          <h1 className="text-[32px] font-[900] text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">Explorar</h1>
          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.4em] mt-2">Eventos Acadêmicos IFAL</p>
        </div>

        <div className="relative">
          <input 
            type="text"
            className="w-full h-16 pl-14 pr-6 bg-slate-100 dark:bg-zinc-900 border-none rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-400"
            placeholder="O que você quer aprender hoje?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary text-2xl font-black">search</span>
        </div>
      </header>

      <main className="px-6 space-y-10">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Tipo de Atividade</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {eventTypes.map((type) => (
              <button 
                key={type.name}
                onClick={() => setSelectedType(type.name)}
                className={`flex items-center gap-2 shrink-0 h-12 px-6 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 border ${
                  selectedType === type.name 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Período</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {periods.map((p) => (
              <button 
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`shrink-0 h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedPeriod === p 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg' 
                  : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
            {filteredEvents.length} Encontrados
          </span>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-300 uppercase">Ordem:</span>
            <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase cursor-pointer">
              Recentes
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 pb-20">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onClick={() => navigateTo('details', event.id)} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default EventsList;
