
import React, { useState } from 'react';
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
  
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.campus.toLowerCase().includes(search.toLowerCase())
  );

  const featured = filteredEvents.slice(0, 4);

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-1000 bg-slate-50 dark:bg-[#09090b] min-h-screen pb-20">
      <header className="px-8 pt-16 pb-10">
        <div className="flex items-start justify-between mb-10 gap-6 relative z-20">
          <div className="flex flex-col flex-1">
            <div className="mb-4">
               <span className="text-slate-900 dark:text-white font-[1000] text-2xl tracking-tighter uppercase">Si<span className="text-primary">gea</span></span>
            </div>
            <h1 className="text-[48px] lg:text-[64px] font-[1000] text-slate-900 dark:text-white uppercase tracking-[-0.05em] leading-[0.85] mt-2">
              Olá,<br /><span className="text-primary truncate block max-w-[300px]">{profile?.name?.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-3 mt-6">
              <div className="size-2 rounded-full bg-primary shadow-[0_0_15px_#10b981]"></div>
              <span className="text-[10px] font-[900] uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 truncate max-w-[240px]">
                {profile?.campus || 'INSTITUCIONAL'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-4 shrink-0 pt-2">
             <button onClick={onNotify} className="relative size-14 flex items-center justify-center rounded-[1.5rem] bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-400 active:scale-90 transition-all shadow-xl shadow-black/5">
                <span className="material-symbols-outlined text-[28px]">notifications</span>
                {hasUnread && <span className="absolute top-3.5 right-3.5 size-2.5 bg-primary rounded-full ring-4 ring-white dark:ring-[#09090b]"></span>}
             </button>
             <div 
                onClick={() => navigateTo('profile')}
                className="size-14 rounded-[1.5rem] bg-primary flex items-center justify-center text-white font-black text-sm cursor-pointer active:scale-90 transition-all shadow-xl shadow-primary/20 overflow-hidden ring-4 ring-white dark:ring-white/5"
              >
                {profile?.photo ? (
                  <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-xs uppercase font-black">{profile?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
          </div>
        </div>

        <div className="relative group max-w-2xl z-10">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
             <span className="material-symbols-outlined text-primary text-[28px]">search</span>
          </div>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-18 pl-16 pr-8 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/5 rounded-[2rem] outline-none text-sm font-black focus:ring-8 focus:ring-primary/5 transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-800 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.3em] text-slate-900 dark:text-white shadow-xl shadow-black/5"
            placeholder="Descobrir Congressos"
          />
        </div>
      </header>

      <main className="space-y-14">
        <section>
          <div className="px-8 flex items-center justify-between mb-8">
            <div className="flex flex-col gap-2">
               <h3 className="text-[13px] font-[1000] uppercase tracking-[0.2em] text-slate-900 dark:text-white">Destaques</h3>
               <div className="w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_#10b981]"></div>
            </div>
            <button onClick={() => navigateTo('events')} className="px-6 py-3.5 bg-white dark:bg-[#18181b] rounded-full text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all border border-slate-200 dark:border-white/5 shadow-xl shadow-black/5">
               Catálogo
               <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          
          <div className="flex gap-8 overflow-x-auto no-scrollbar px-8 pb-10">
            {featured.length > 0 ? featured.map(event => (
              <EventCard key={event.id} event={event} horizontal onClick={() => navigateTo('details', event.id)} />
            )) : (
              <div className="w-full py-20 text-center bg-white dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-widest">Nenhum evento encontrado</p>
              </div>
            )}
          </div>
        </section>

        <section className="px-8 pb-12">
           <div className="flex flex-col gap-2 mb-8">
               <h3 className="text-[13px] font-[1000] uppercase tracking-[0.2em] text-slate-900 dark:text-white">Mais Recentes</h3>
               <div className="w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_#10b981]"></div>
            </div>
            <div className="grid gap-6">
              {filteredEvents.slice(4, 10).map(event => (
                <EventCard key={event.id} event={event} onClick={() => navigateTo('details', event.id)} />
              ))}
              {filteredEvents.length === 0 && (
                <div className="py-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Tente um termo diferente
                </div>
              )}
            </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
