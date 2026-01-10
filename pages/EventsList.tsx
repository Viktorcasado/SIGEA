
import React, { useState, useMemo } from 'react';
import EventCard from '../components/EventCard';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import Logo from '../components/Logo.tsx';

interface EventsListProps {
  navigateTo: (page: string, id?: string) => void;
  events: Event[];
}

const EventsList: React.FC<EventsListProps> = ({ navigateTo, events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedCampus, setSelectedCampus] = useState('Todos');

  const eventTypes = [
    { name: 'Todos', icon: 'grid_view' },
    { name: 'Workshop', icon: 'build' },
    { name: 'Palestra', icon: 'record_voice_over' },
    { name: 'Congresso', icon: 'groups' }
  ];

  const campuses = ['Todos', ...CAMPUS_LIST];

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'Todos' || event.type === selectedType;
      const matchesCampus = selectedCampus === 'Todos' || event.campus === selectedCampus;
      return matchesSearch && matchesType && matchesCampus;
    });
  }, [events, searchTerm, selectedType, selectedCampus]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6 space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigateTo('home')}
              className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] font-black">arrow_back_ios_new</span>
            </button>
            <div className="flex flex-col">
              <h1 className="text-[32px] font-[900] text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">Explorar</h1>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.4em] mt-1">Acervo Institucional</p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-80 scale-90">
            <Logo size="sm" />
          </div>
          <input 
            type="text"
            className="w-full h-16 pl-20 pr-14 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 ring-1 ring-slate-100 dark:ring-white/5 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 dark:text-white shadow-xl shadow-black/5"
            placeholder="Pesquisar por título ou tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 active:scale-90 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </header>

      <main className="px-6 space-y-10">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-600 px-1">Unidade / Campus</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {campuses.map((c) => (
              <button 
                key={c}
                onClick={() => setSelectedCampus(c)}
                className={`shrink-0 h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedCampus === c 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-500 dark:text-zinc-500 shadow-sm'
                }`}
              >
                {c.replace('IFAL - Campus ', '')}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-600 px-1">Tipo de Atividade</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {eventTypes.map((type) => (
              <button 
                key={type.name}
                onClick={() => setSelectedType(type.name)}
                className={`flex items-center gap-2 shrink-0 h-12 px-6 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 border ${
                  selectedType === type.name 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-500 dark:text-zinc-500 shadow-sm'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-5">
          <span className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-[0.3em]">
            {filteredEvents.length} Encontrados
          </span>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase">Filtros Ativos</span>
            <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
          </div>
        </div>

        <div className="flex flex-col gap-6 pb-20">
          {filteredEvents.length > 0 ? filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onClick={() => navigateTo('details', event.id)} />
          )) : (
            <div className="py-24 text-center bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 shadow-sm">
              <p className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-8">
                Nenhum evento encontrado para os filtros selecionados.
              </p>
              <button 
                onClick={() => { setSelectedCampus('Todos'); setSelectedType('Todos'); setSearchTerm(''); }}
                className="mt-6 text-primary text-[10px] font-black uppercase tracking-widest hover:underline active:scale-95 transition-transform"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventsList;
