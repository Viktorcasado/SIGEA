
import React, { useState } from 'react';
import EventCard from '../components/EventCard.tsx';
import { Event as SIGEAEvent } from '../types.ts';
import { CAMPUS_LIST } from '../constants';
import Logo from '../components/Logo.tsx';

interface HomeProps {
  navigateTo: (page: string, id?: string) => void;
  profile: any;
  events: SIGEAEvent[];
  onNotify: () => void;
  hasUnread?: boolean;
  openPortal: (url: string, name: string) => void;
}

const Home: React.FC<HomeProps> = ({ navigateTo, profile, events, onNotify, hasUnread, openPortal }) => {
  const [search, setSearch] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('Todos');
  
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                         e.campus.toLowerCase().includes(search.toLowerCase());
    const matchesCampus = selectedCampus === 'Todos' || e.campus === selectedCampus;
    return matchesSearch && matchesCampus;
  });

  const featured = filteredEvents.slice(0, 4);
  const quickCampuses = ['Todos', ...CAMPUS_LIST];

  const portals = [
    { name: 'SUAP', icon: 'account_balance', color: 'bg-emerald-500', url: 'https://suap.ifal.edu.br' },
    { name: 'SIGAA', icon: 'school', color: 'bg-blue-500', url: 'https://sigaa.ifal.edu.br' },
    { name: 'SIGRH', icon: 'badge', color: 'bg-red-500', url: 'https://sigrh.ifal.edu.br' },
    { name: 'SIPAC', icon: 'inventory_2', color: 'bg-amber-500', url: 'https://sipac.ifal.edu.br' },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700 bg-slate-50 dark:bg-[#09090b] min-h-screen pb-24">
      <header className="px-6 lg:px-12 pt-12 lg:pt-16 pb-8">
        <div className="flex items-center justify-between mb-8 lg:mb-10 relative z-20">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 lg:mb-4">
               <span className="text-slate-900 dark:text-white font-[1000] text-xl lg:text-2xl tracking-tighter uppercase">Si<span className="text-primary">gea</span></span>
               <div className="size-1 bg-primary rounded-full"></div>
            </div>
            <h1 className="text-[34px] lg:text-[72px] font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9] mt-1">
              Olá,<br /><span className="text-primary truncate block lg:max-w-xl">{profile?.name?.split(' ')[0]}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
             <button 
                onClick={onNotify} 
                className="size-14 lg:size-14 flex items-center justify-center rounded-2xl lg:rounded-[1.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-400 active:scale-90 transition-all shadow-lg hover:border-primary/30"
              >
                <span className="material-symbols-outlined text-[28px] lg:text-[28px]">notifications</span>
                {hasUnread && <span className="absolute top-3.5 right-3.5 size-2.5 bg-primary rounded-full ring-2 ring-white dark:ring-[#09090b]"></span>}
             </button>
             <div 
                onClick={() => navigateTo('profile')}
                className="size-14 lg:size-14 rounded-2xl lg:rounded-[1.5rem] bg-primary flex items-center justify-center text-white font-black text-sm cursor-pointer active:scale-90 transition-all shadow-lg overflow-hidden ring-2 ring-white dark:ring-white/5"
              >
                {profile?.photo ? (
                  <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-sm uppercase font-black">{profile?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
          </div>
        </div>

        <div className="relative group max-w-2xl z-10 lg:ml-0 space-y-6">
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-80 scale-90">
              <Logo size="sm" />
            </div>
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-16 lg:h-18 pl-18 lg:pl-20 pr-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl lg:rounded-[2rem] outline-none text-[15px] font-bold focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 text-slate-900 dark:text-white shadow-xl shadow-black/5"
              placeholder="Congressos e Oficinas"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
             {quickCampuses.map(c => (
               <button 
                key={c}
                onClick={() => setSelectedCampus(c)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  selectedCampus === c 
                  ? 'bg-primary border-primary text-white shadow-lg' 
                  : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5 text-slate-400'
                }`}
               >
                 {c.replace('IFAL - Campus ', '')}
               </button>
             ))}
          </div>
        </div>
      </header>

      <main className="space-y-12 lg:space-y-24">
        {/* Quick Links Section */}
        <section className="px-6 lg:px-12">
          <div className="flex flex-col gap-1 mb-6">
             <h3 className="text-[12px] font-[1000] uppercase tracking-[0.2em] text-slate-900 dark:text-white">Portais Institucionais</h3>
             <div className="w-6 h-1 bg-primary rounded-full"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 lg:grid-cols-8">
            {portals.map((portal) => (
              <button 
                key={portal.name}
                onClick={() => openPortal(portal.url, portal.name)}
                className="flex flex-col items-center gap-2 group transition-all"
              >
                <div className={`size-14 lg:size-16 rounded-[1.5rem] ${portal.color} flex items-center justify-center text-white shadow-lg group-active:scale-90 transition-transform group-hover:rotate-6`}>
                  <span className="material-symbols-outlined text-2xl">{portal.icon}</span>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 group-hover:text-primary transition-colors tracking-widest">{portal.name}</span>
              </button>
            ))}
            <button 
                onClick={() => navigateTo('integrations')}
                className="flex flex-col items-center gap-2 group transition-all"
              >
                <div className="size-14 lg:size-16 rounded-[1.5rem] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 group-active:scale-90 transition-transform shadow-sm group-hover:border-primary">
                  <span className="material-symbols-outlined text-2xl">sync</span>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 group-hover:text-primary transition-colors tracking-widest">Sinc</span>
              </button>
          </div>
        </section>

        <section>
          <div className="px-6 lg:px-12 flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
               <h3 className="text-[12px] font-[1000] uppercase tracking-[0.2em] text-slate-900 dark:text-white">Destaques {selectedCampus !== 'Todos' && `• ${selectedCampus.replace('IFAL - Campus ', '')}`}</h3>
               <div className="w-6 h-1 bg-primary rounded-full"></div>
            </div>
            <button onClick={() => navigateTo('events')} className="px-5 py-2.5 bg-white dark:bg-zinc-900 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all border border-slate-100 dark:border-white/5 shadow-sm">
               Ver Tudo
               <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 lg:px-12 pb-6">
            {featured.length > 0 ? featured.map(event => (
              <EventCard key={event.id} event={event} horizontal onClick={() => navigateTo('details', event.id)} />
            )) : (
              <div className="min-w-[300px] h-[420px] text-center bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-4 px-8">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-800">search_off</span>
                <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest leading-relaxed">Nenhum evento em {selectedCampus !== 'Todos' ? selectedCampus : 'destaque'} no momento.</p>
                <button onClick={() => setSelectedCampus('Todos')} className="text-primary text-[9px] font-black uppercase tracking-widest">Mostrar Todos</button>
              </div>
            )}
          </div>
        </section>

        <section className="px-6 lg:px-12 pb-12">
           <div className="flex flex-col gap-1 mb-6">
               <h3 className="text-[12px] font-[1000] uppercase tracking-[0.2em] text-slate-900 dark:text-white">Recentes</h3>
               <div className="w-6 h-1 bg-primary rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8">
              {filteredEvents.slice(4, 13).map(event => (
                <EventCard key={event.id} event={event} onClick={() => navigateTo('details', event.id)} />
              ))}
              {filteredEvents.length === 0 && (
                <div className="col-span-full py-16 text-center text-[10px] font-black text-slate-400 dark:text-zinc-700 uppercase tracking-widest bg-white dark:bg-zinc-900/30 rounded-[2rem] border border-dashed border-slate-100 dark:border-white/5 px-8">
                  Nada encontrado para "{search || selectedCampus}"
                </div>
              )}
            </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
