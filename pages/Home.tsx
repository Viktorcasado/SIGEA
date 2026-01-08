
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
    <div className="flex flex-col w-full animate-in fade-in duration-700 bg-[#09090b] min-h-screen">
      <header className={`px-6 lg:px-0 ${isDesktop ? 'mb-12 pt-10' : 'pt-12 pb-6'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <div className="mb-4">
              <Logo size="sm" dark />
            </div>
            <h1 className={`${isDesktop ? 'text-6xl' : 'text-[44px]'} font-[900] text-white uppercase tracking-[-0.04em] leading-[0.85]`}>
              BEM-VINDO,<br />{profile?.name?.split(' ')[0]}
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <div className={`size-2.5 rounded-full ${isDemoMode ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'bg-primary shadow-[0_0_12px_rgba(16,185,129,0.6)]'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600">
                {isDemoMode ? 'MODO DEMONSTRAÇÃO ATIVO' : 'IFAL CLOUD ACTIVE'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-4">
             <button onClick={onNotify} className="size-16 flex items-center justify-center rounded-[1.8rem] bg-[#121214] border border-white/5 text-zinc-500 relative active:scale-90 transition-all hover:bg-zinc-800">
                <span className="material-symbols-outlined text-[32px]">notifications</span>
                {hasUnread && <span className="absolute top-5 right-5 size-3 bg-primary rounded-full ring-4 ring-[#09090b]"></span>}
             </button>
             <div 
                onClick={() => navigateTo('profile')}
                className="size-16 rounded-[1.8rem] bg-primary shadow-2xl shadow-primary/20 cursor-pointer flex items-center justify-center text-white font-[900] text-2xl relative overflow-hidden active:scale-90 transition-all"
              >
                {profile?.photo ? (
                  <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  profile?.name?.charAt(0) || 'C'
                )}
              </div>
          </div>
        </div>

        {/* Barra de Pesquisa Refinada */}
        <div className="relative group max-w-2xl mt-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center">
             <div className="relative size-12 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[38px] font-black">search</span>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1 font-black" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                </div>
             </div>
          </div>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-16 pr-8 bg-[#121214] border border-white/5 rounded-[1.8rem] outline-none text-sm font-bold focus:border-primary/30 focus:bg-zinc-900 transition-all placeholder:text-zinc-700 placeholder:uppercase placeholder:text-[11px] placeholder:tracking-[0.25em] text-white"
            placeholder="PESQUISAR CONGRESSOS E EVENTOS..."
          />
        </div>
      </header>

      <main className="space-y-14">
        <section>
          <div className="px-6 lg:px-0 flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1.5">
               <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-white">Destaques da Semana</h3>
               <div className="w-14 h-1.5 bg-primary rounded-full"></div>
            </div>
            <button onClick={() => navigateTo('events')} className="px-6 py-3.5 bg-[#121214] border border-white/5 text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.8rem] hover:bg-zinc-800 transition-all flex items-center gap-3 group">
               Catálogo Completo
               <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
          <div className={`flex gap-6 overflow-x-auto no-scrollbar px-6 lg:px-0 pb-4 ${isDesktop ? 'grid grid-cols-4 lg:overflow-visible' : ''}`}>
            {featured.map(event => (
              <EventCard key={event.id} event={event} horizontal onClick={() => navigateTo('details', event.id)} />
            ))}
          </div>
        </section>

        <section className="px-6 lg:px-0 space-y-10 pb-32">
          <div className="flex items-center justify-between">
             <div className="flex flex-col gap-1.5">
                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-white">Todas as Atividades</h3>
                <div className="w-14 h-1.5 bg-zinc-800 rounded-full"></div>
             </div>
             <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest bg-[#121214] px-5 py-2.5 rounded-full border border-white/5">{filtered.length} Ativos</span>
          </div>
          <div className={`grid gap-6 ${isDesktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map(event => (
              <EventCard key={event.id} event={event} onClick={() => navigateTo('details', event.id)} />
            ))}
          </div>
        </section>
      </main>

      {!isDesktop && (
        <div className="fixed bottom-32 right-6 flex flex-col gap-5 z-[4000]">
          <button 
            onClick={() => navigateTo('check-in')}
            className="size-16 rounded-[1.8rem] bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-white/20"
          >
            <span className="material-symbols-outlined text-4xl font-black">qr_code_scanner</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
