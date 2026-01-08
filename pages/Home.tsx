
import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard.tsx';
import { Event as SIGEAEvent } from '../types.ts';

interface HomeProps {
  navigateTo: (page: string, id?: string) => void;
  profile: any;
  events: SIGEAEvent[];
  onNotify: () => void;
  hasUnread?: boolean;
}

const Home: React.FC<HomeProps> = ({ navigateTo, profile, events, onNotify, hasUnread }) => {
  const [search, setSearch] = useState('');
  const featured = events.slice(0, 4);

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700 bg-slate-50 dark:bg-[#09090b] min-h-screen pb-32">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-start justify-between mb-8 gap-4 relative z-20">
          <div className="flex flex-col flex-1">
            <div className="mb-2">
               <span className="text-slate-900 dark:text-white font-black text-xl tracking-tight">Sigea</span>
            </div>
            <h1 className="text-[42px] lg:text-[56px] font-[900] text-slate-900 dark:text-white uppercase tracking-[-0.03em] leading-[1.1] mt-2">
              BEM-<br />VINDO,<br /><span className="text-primary truncate block max-w-[280px]">{profile?.name?.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <div className="size-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 truncate max-w-[200px]">
                {profile?.campus || 'CAMPUS NÃO INFORMADO'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 shrink-0 pt-2">
             <button onClick={onNotify} className="relative size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-400 active:scale-90 transition-all shadow-sm">
                <span className="material-symbols-outlined">notifications</span>
                {hasUnread && <span className="absolute top-2 right-2 size-2.5 bg-primary rounded-full ring-2 ring-slate-50 dark:ring-[#09090b]"></span>}
             </button>
             <div 
                onClick={() => navigateTo('profile')}
                className="size-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center text-[#09090b] font-black text-sm cursor-pointer active:scale-90 transition-all border-2 border-white dark:border-white/10 shadow-sm overflow-hidden"
              >
                {profile?.photo ? (
                  <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-[10px] uppercase font-black text-slate-400">SIGEA</span>
                )}
              </div>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative group mt-2 max-w-2xl z-10">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
             <span className="material-symbols-outlined text-primary text-[24px]">search</span>
          </div>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 lg:h-16 pl-14 pr-6 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/5 rounded-2xl lg:rounded-full outline-none text-sm font-bold focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700 placeholder:uppercase placeholder:text-[9px] placeholder:tracking-[0.2em] text-slate-900 dark:text-white shadow-sm"
            placeholder="PESQUISAR CONGRESSOS E EVENTOS"
          />
        </div>
      </header>

      <main className="space-y-12">
        <section>
          <div className="px-6 flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
               <h3 className="text-[14px] font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white">Destaques da Semana</h3>
               <div className="w-12 h-1 bg-primary rounded-full"></div>
            </div>
            <button onClick={() => navigateTo('events')} className="px-5 py-3 bg-white dark:bg-[#18181b] rounded-full text-primary text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 active:scale-95 transition-all border border-slate-200 dark:border-white/5 shadow-sm">
               Catálogo
               <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 pb-4">
            {featured.map(event => (
              <EventCard key={event.id} event={event} horizontal onClick={() => navigateTo('details', event.id)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
