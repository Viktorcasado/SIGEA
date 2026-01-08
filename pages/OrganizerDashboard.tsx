
import React from 'react';
import Logo from '../components/Logo.tsx';
import { Event } from '../types.ts';

interface OrganizerDashboardProps {
  navigateTo: (page: string, id?: string) => void;
  onNotify: () => void;
  profile: { name: string, photo: string };
  events: Event[];
  hasUnread?: boolean;
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ navigateTo, onNotify, profile, events, hasUnread }) => {
  const firstName = (profile?.name || 'Organizador').split(' ')[0];

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-[#09090b] animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => navigateTo('profile')}
              className="size-11 rounded-2xl bg-cover bg-center border-2 border-white dark:border-zinc-800 shadow-md cursor-pointer flex items-center justify-center bg-primary text-white font-black text-sm overflow-hidden"
              style={profile?.photo ? { backgroundImage: `url("${profile.photo}")` } : {}}
            >
              {!profile?.photo && (profile?.name?.charAt(0) || 'U')}
            </div>
            <Logo size="md" dark={false} className="dark:hidden" />
            <Logo size="md" dark={true} className="hidden dark:block" />
          </div>
          <button onClick={onNotify} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-400 relative active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[26px]">notifications</span>
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 size-2.5 bg-primary rounded-full ring-2 ring-white dark:ring-zinc-900 shadow-lg animate-in zoom-in duration-300"></span>
            )}
          </button>
        </div>
      </header>

      <main className="p-6 pt-0 space-y-10">
        <section>
          <div className="flex flex-col mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.25em]">Área Administrativa</p>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
                <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Sincronizado</span>
              </div>
            </div>
            <h3 className="text-[32px] font-[900] text-slate-900 dark:text-white leading-none uppercase tracking-tighter">Olá, {firstName}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigateTo('create-event')}
              className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] bg-primary text-white shadow-2xl shadow-primary/30 transition-all active:scale-95 group border-2 border-white/10"
            >
              <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-3xl font-bold">add_circle</span>
              </div>
              <span className="text-[10px] font-[900] uppercase tracking-widest text-center">Novo Evento</span>
            </button>
            <button 
              onClick={() => navigateTo('check-in')} 
              className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 shadow-sm transition-all active:scale-95 text-center group"
            >
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl font-bold">qr_code_scanner</span>
              </div>
              <span className="text-[10px] font-[900] uppercase text-slate-500 dark:text-zinc-400 tracking-widest">Check-in</span>
            </button>
          </div>
        </section>

        <section>
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-[900] uppercase tracking-[0.25em] text-slate-400 dark:text-zinc-500">Eventos Ativos</h3>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">{events.length} Publicações</span>
          </div>
          <div className="space-y-4 pb-20">
            {events.length > 0 ? events.map(event => (
              <div 
                key={event.id} 
                onClick={() => navigateTo('manage-event', event.id)} 
                className="group flex gap-4 p-5 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 cursor-pointer active:scale-[0.98] transition-all hover:border-primary/40"
              >
                <div className="shrink-0 size-20 rounded-2xl bg-cover bg-center shadow-inner overflow-hidden relative">
                  <img src={event.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={event.title} />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{event.type}</span>
                    <span className="size-1 bg-slate-200 dark:bg-zinc-700 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-400 uppercase">{event.status}</span>
                  </div>
                  <h4 className="text-[12px] font-[900] leading-tight truncate uppercase text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">{event.title}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex-1 bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mr-3">
                      <div className="bg-primary h-full" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-[9px] font-black text-primary">75%</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center shadow-sm">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">event_busy</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum evento registrado</p>
                <button onClick={() => navigateTo('create-event')} className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest">Adicionar Agora</button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrganizerDashboard;
