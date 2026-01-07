
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
            <h1 className={`${isDesktop ? 'text-4xl' : 'text-2xl'} font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none`}>
              Bem-vindo, {profile?.name?.split(' ')[0]}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className={`size-1.5 rounded-full ${isDemoMode ? 'bg-amber-400' : isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-primary'}`}></div>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                {isDemoMode ? 'Modo Demonstração Ativo' : isSyncing ? 'Sincronizando' : 'IFAL Database Active'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-4">
             <button onClick={onNotify} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-white/5 text-slate-400 dark:text-zinc-400 relative active:scale-90 transition-all hover:bg-slate-50 dark:hover:bg-zinc-800">
                <span className="material-symbols-outlined text-[26px]">notifications</span>
                {hasUnread && <span className="absolute top-3 right-3 size-2.5 bg-primary rounded-full ring-4 ring-slate-50 dark:ring-zinc-950"></span>}
             </button>
             {!isDesktop && (
                <div 
                  onClick={() => navigateTo('profile')}
                  className="size-12 rounded-2xl bg-cover bg-center border-2 border-slate-200 dark:border-white/5 shadow-md cursor-pointer flex items-center justify-center bg-primary text-white font-black text-sm"
                  style={profile?.photo ? { backgroundImage: `url("${profile.photo}")` } : {}}
                >
                  {!profile?.photo && (profile?.name?.charAt(0) || 'U')}
                </div>
             )}
          </div>
        </div>

        <div className="relative group max-w-2xl">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-white dark:bg-zinc-900 rounded-3xl outline-none text-[15px] font-bold border border-slate-200 dark:border-white/5 focus:border-primary/40 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest dark:text-white"
            placeholder="Buscar por congressos, workshops ou cursos..."
          />
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary text-2xl font-black">search</span>
        </div>
      </header>

      <main className="space-y-16">
        <section>
          <div className="px-6 lg:px-0 flex items-center justify-between mb-8">
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 border-l-4 border-primary pl-4">Destaques da Semana</h3>
            <button onClick={() => navigateTo('events')} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Ver catálogo</button>
          </div>
          <div className={`flex gap-6 overflow-x-auto no-scrollbar px-6 lg:px-0 ${isDesktop ? 'grid grid-cols-4 lg:overflow-visible' : ''}`}>
            {featured.map(event => (
              <EventCard key={event.id} event={event} horizontal onClick={() => navigateTo('details', event.id)} />
            ))}
          </div>
        </section>

        <section className="px-6 lg:px-0 space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 border-l-4 border-slate-300 dark:border-zinc-700 pl-4">Todas as Atividades</h3>
             <span className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-slate-100 dark:border-white/5">{filtered.length} Itens</span>
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
          className="fixed bottom-28 right-6 z-[4000] size-16 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group border border-white/20"
        >
          <span className="material-symbols-outlined text-3xl font-black">qr_code_scanner</span>
        </button>
      )}
    </div>
  );
};

export default Home;
