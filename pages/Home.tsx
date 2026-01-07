
import React, { useState } from 'react';
import EventCard from '../components/EventCard.tsx';
import Logo from '../components/Logo.tsx';
import { Event as SIGEAEvent } from '../types.ts';

interface HomeProps {
  navigateTo: (page: string, id?: string) => void;
  profile: any;
  events: SIGEAEvent[];
  onNotify: () => void;
  hasUnread?: boolean;
  isSyncing?: boolean;
}

const Home: React.FC<HomeProps> = ({ navigateTo, profile, events, onNotify, hasUnread, isSyncing }) => {
  const [search, setSearch] = useState('');
  
  const featured = events.slice(0, 3);
  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark animate-in fade-in duration-700">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => navigateTo('profile')}
              className="size-11 rounded-2xl bg-cover bg-center border-2 border-white dark:border-zinc-800 shadow-md cursor-pointer flex items-center justify-center bg-primary text-white font-black text-sm"
              style={profile?.photo ? { backgroundImage: `url("${profile.photo}")` } : {}}
            >
              {!profile?.photo && (profile?.name?.charAt(0) || 'U')}
            </div>
            <div className="flex flex-col">
              <Logo size="md" />
              <div className="flex items-center gap-1.5 ml-0.5 mt-0.5">
                <div className={`size-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-primary'}`}></div>
                <span className="text-[7px] font-black uppercase tracking-widest text-zinc-400">
                  {isSyncing ? 'Sincronizando' : 'Live Database'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onNotify} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 relative active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[26px]">notifications</span>
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 size-2.5 bg-primary rounded-full ring-2 ring-white dark:ring-zinc-900 shadow-lg animate-in zoom-in duration-300"></span>
            )}
          </button>
        </div>

        <div className="relative group">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-white dark:bg-zinc-900 rounded-3xl outline-none text-[15px] font-bold shadow-sm border border-zinc-100 dark:border-zinc-800 focus:border-primary/30 transition-all placeholder:text-zinc-300 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em]"
            placeholder="Buscar eventos..."
          />
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary text-2xl font-black">search</span>
        </div>
      </header>

      <main className="space-y-10 pb-12">
        <section>
          <div className="px-7 flex items-center justify-between mb-5">
            <h3 className="text-[11px] font-[900] uppercase tracking-[0.25em] text-zinc-400">Em Destaque</h3>
            <button onClick={() => navigateTo('events')} className="text-primary text-[10px] font-black uppercase tracking-widest">Ver tudo</button>
          </div>
          <div className="flex gap-5 overflow-x-auto no-scrollbar px-6 pb-6">
            {featured.map(event => (
              <EventCard key={event.id} event={event} horizontal onClick={() => navigateTo('details', event.id)} />
            ))}
          </div>
        </section>

        <section className="px-7 space-y-5">
          <div className="flex items-center justify-between">
             <h3 className="text-[11px] font-[900] uppercase tracking-[0.25em] text-zinc-400">Feed de Notícias</h3>
             <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{filtered.length} Atividades</span>
          </div>
          <div className="grid gap-5">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} onClick={() => navigateTo('details', event.id)} />
            ))}
          </div>
        </section>
      </main>

      <button 
        onClick={() => navigateTo('check-in')}
        className="fixed bottom-28 right-6 z-[4000] size-16 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group border border-white/20"
      >
        <span className="material-symbols-outlined text-3xl font-black">qr_code_scanner</span>
      </button>
    </div>
  );
};

export default Home;
