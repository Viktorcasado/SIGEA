
import React, { useState, useEffect } from 'react';
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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const isDemoMode = localStorage.getItem('sigea_demo') === 'true';

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const featured = events.slice(0, isDesktop ? 4 : 3);
  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      <header className={`px-6 lg:px-0 ${isDesktop ? 'mb-12' : 'pt-12 pb-6'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            {!isDesktop && <Logo size="md" />}
            <h1 className={`${isDesktop ? 'text-4xl' : 'text-[28px]'} font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none`}>
              Bem-vindo, {profile?.name?.split(' ')[0]}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className={`size-2 rounded-full ${isDemoMode ? 'bg-amber-400' : isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-primary shadow-[0_0_8px_#10b981]'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                {isDemoMode ? 'Modo Demonstração Ativo' : isSyncing ? 'Sincronizando...' : 'IFAL Cloud Active'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-4">
             <button onClick={onNotify} className="size-14 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl shadow-lg border border-white/50 dark:border-white/5 text-slate-400 dark:text-zinc-400 relative active:scale-90 transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 ring-1 ring-black/5">
                <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
                {hasUnread && <span className="absolute top-4 right-4 size-3 bg-primary rounded-full ring-4 ring-white dark:ring-zinc-950 shadow-lg shadow-primary/20"></span>}
             </button>
             {!isDesktop && (
                <div 
                  onClick={() => navigateTo('profile')}
                  className="size-14 rounded-2xl bg-cover bg-center border-4 border-white/50 dark:border-white/5 shadow-xl cursor-pointer flex items-center justify-center bg-primary text-white font-black text-lg relative overflow-hidden"
                  style={profile?.photo ? { backgroundImage: `url("${profile.photo}")` } : {}}
                >
                  {!profile?.photo && (profile?.name?.charAt(0) || 'U')}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                </div>
             )}
          </div>
        </div>

        <div className="relative group max-w-2xl">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-10 rounded-xl bg-primary/10 backdrop-blur-md">
            <span className="material-symbols-outlined text-primary text-2xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>search_spark</span>
          </div>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-18 pl-18 pr-6 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-[2rem] outline-none text-[16px] font-bold border border-white/50 dark:border-white/5 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] dark:text-white shadow-xl ring-1 ring-black/5"
            placeholder="Pesquisar congressos e eventos..."
          />
        </div>
      </header>

      <main className="space-y-16">
        <section>
          <div className="px-6 lg:px-0 flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
               <h3 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">Destaques da Semana</h3>
               <div className="w-10 h-1 bg-primary rounded-full"></div>
            </div>
            <button onClick={() => navigateTo('events')} className="px-5 py-2.5 bg-primary/10 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary/20 transition-all border border-primary/20 flex items-center gap-2">
               Catálogo Completo
               <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
          <div className={`flex gap-6 overflow-x-auto no-scrollbar px-6 lg:px-0 pb-4 ${isDesktop ? 'grid grid-cols-4 lg:overflow-visible' : ''}`}>
            {featured.map(event => (
              <EventCard key={event.id} event={event} horizontal onClick={() => navigateTo('details', event.id)} />
            ))}
          </div>
        </section>

        <section className="px-6 lg:px-0 space-y-8">
          <div className="flex items-center justify-between">
             <div className="flex flex-col gap-1">
                <h3 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">Todas as Atividades</h3>
                <div className="w-10 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full"></div>
             </div>
             <span className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-100 dark:border-white/5 shadow-sm">{filtered.length} Ativos</span>
          </div>
          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map(event => (
              <EventCard key={event.id} event={event} onClick={() => navigateTo('details', event.id)} />
            ))}
          </div>
        </section>
      </main>

      {!isDesktop && (
        <button 
          onClick={() => navigateTo('check-in')}
          className="fixed bottom-48 right-6 z-[4000] size-16 rounded-[1.8rem] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl text-primary shadow-2xl border border-white/50 dark:border-white/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group ring-1 ring-black/5"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
          <span className="material-symbols-outlined text-3xl font-black relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
        </button>
      )}
    </div>
  );
};

export default Home;
