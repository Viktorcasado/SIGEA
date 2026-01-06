
import React, { useState } from 'react';
import { CAMPUS_LIST } from '../constants';
import EventCard from '../components/EventCard';
import Logo from '../components/Logo';
import { Event } from '../types';

interface HomeProps {
  navigateTo: (page: string, eventId?: string) => void;
  profile: { name: string; photo: string; campus: string };
  onNotify: () => void;
  events: Event[];
  unreadNotifications: number;
}

const Home: React.FC<HomeProps> = ({ navigateTo, profile, onNotify, events, unreadNotifications }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.campus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-20">

      {/* Hero Header */}
      <header className="px-6 pt-8 pb-6 bg-white dark:bg-[#1e293b] rounded-b-[3rem] shadow-sm z-30">
        <div className="flex justify-center mb-6">
          <Logo className="h-12" />
        </div>

        <div className="flex items-center justify-between mb-8">
          {/* Esquerda: Notificações */}
          <button onClick={onNotify} className="size-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center relative active:scale-95 transition-all order-1">
            <span className="material-symbols-outlined">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-3 right-3.5 size-2 bg-red-500 rounded-full border border-white dark:border-slate-800 animate-pulse"></span>
            )}
          </button>

          {/* Centro: Saudação */}
          <div className="flex flex-col items-center order-2">
            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none">
              Olá, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{profile.campus || 'Visitante'}</p>
          </div>

          {/* Direita: Espaçador para equilíbrio */}
          <div className="order-3 size-11"></div>
        </div>

        {/* Search Bar - Moderno */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Buscar eventos, palestras..."
            className="w-full h-14 pl-12 pr-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl font-bold text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="space-y-8 mt-6">

        {/* Filtros de Campus */}
        <div className="pl-6">
          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2 pr-6">
            {CAMPUS_LIST.slice(0, 6).map(campus => (
              <button
                key={campus}
                onClick={() => setSearchTerm(campus === searchTerm ? '' : campus.replace('Campus ', ''))}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchTerm === campus.replace('Campus ', '') ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700'}`}
              >
                {campus.replace('Campus ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Destaque / Carrossel */}
        {filteredEvents.length > 0 && (
          <div className="pl-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Em Destaque 🔥</h2>
            <div className="flex overflow-x-auto gap-5 no-scrollbar pb-8 pr-6 snap-x snap-mandatory">
              {filteredEvents.slice(0, 5).map(event => (
                <div key={event.id} className="snap-center shrink-0 w-[85vw] max-w-[320px]">
                  <EventCard event={event} horizontal onClick={() => navigateTo('details', event.id)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos os Eventos - Lista Clean */}
        <div className="px-6 pb-12">
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Próximos Eventos</h2>
          <div className="space-y-4">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => navigateTo('details', event.id)}
                className="flex gap-4 p-4 bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all"
              >
                <div className="shrink-0 flex flex-col items-center justify-center size-16 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black text-primary uppercase">{event.date.split(' ')[1] || 'MÊS'}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{event.date.split('-')[0]}</span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-black text-sm text-slate-800 dark:text-white truncate uppercase">{event.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[12px] text-slate-400">location_on</span>
                    <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{event.campus}</p>
                  </div>
                </div>
                <div className="self-center">
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Home;
