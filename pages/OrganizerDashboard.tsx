
import React, { useMemo } from 'react';
import Logo from '../components/Logo.tsx';
import { Event, UserRole } from '../types.ts';

interface OrganizerDashboardProps {
  navigateTo: (page: string, id?: string) => void;
  onNotify: () => void;
  profile: { id: string, name: string, photo: string };
  events: Event[];
  hasUnread?: boolean;
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ navigateTo, onNotify, profile, events, hasUnread }) => {
  const firstName = (profile?.name || 'Organizador').split(' ')[0];

  // Filtra apenas eventos que pertencem a este organizador
  const myEvents = useMemo(() => {
    return events.filter(e => e.organizer_id === profile.id);
  }, [events, profile.id]);

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-[#09090b] animate-in fade-in duration-700">
      <header className="px-8 pt-16 pb-10 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-[#09090b]/80 backdrop-blur-3xl z-50 transition-colors">
        <div className="flex items-center gap-5">
          <div 
            onClick={() => navigateTo('profile')}
            className="size-14 rounded-[1.5rem] bg-cover bg-center border-[4px] border-white dark:border-zinc-800 shadow-2xl cursor-pointer flex items-center justify-center bg-primary text-white font-black text-sm overflow-hidden"
            style={profile?.photo ? { backgroundImage: `url("${profile.photo}")` } : {}}
          >
            {!profile?.photo && (profile?.name?.charAt(0) || 'O')}
          </div>
          <Logo size="md" />
        </div>
        <button onClick={onNotify} className="size-14 flex items-center justify-center rounded-[1.5rem] bg-white dark:bg-zinc-900 shadow-2xl shadow-black/5 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-400 relative active:scale-90 transition-all">
          <span className="material-symbols-outlined text-[30px]">notifications</span>
          {hasUnread && (
            <span className="absolute top-4 right-4 size-2.5 bg-primary rounded-full ring-4 ring-white dark:ring-zinc-900 animate-pulse"></span>
          )}
        </button>
      </header>

      <main className="p-8 pt-4 space-y-14">
        <section>
          <div className="flex flex-col mb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.4em]">Painel de Controle</p>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Sincronizado</span>
              </div>
            </div>
            <h3 className="text-[48px] font-[1000] text-slate-900 dark:text-white leading-[0.8] uppercase tracking-[-0.05em]">Bom dia,<br />{firstName}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => navigateTo('create-event')}
              className="flex flex-col items-center justify-center gap-6 p-10 rounded-[3rem] bg-primary text-white shadow-2xl shadow-primary/40 transition-all active:scale-95 group border-2 border-white/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <span className="material-symbols-outlined text-6xl">add_circle</span>
              </div>
              <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/30 relative z-10">
                <span className="material-symbols-outlined text-4xl font-black">add</span>
              </div>
              <span className="text-[11px] font-[900] uppercase tracking-widest text-center relative z-10 leading-tight">Novo <br /> Evento</span>
            </button>
            <button 
              onClick={() => {
                if (myEvents.length > 0) navigateTo('check-in', myEvents[0].id);
                else alert("Você precisa criar um evento antes de realizar check-ins.");
              }} 
              className="flex flex-col items-center justify-center gap-6 p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 shadow-xl shadow-black/5 transition-all active:scale-95 text-center group"
            >
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform ring-1 ring-primary/20">
                <span className="material-symbols-outlined text-4xl font-black">qr_code_scanner</span>
              </div>
              <span className="text-[11px] font-[900] uppercase text-slate-900 dark:text-white tracking-widest leading-tight">Painel <br /> Check-in</span>
            </button>
          </div>
        </section>

        <section className="pb-20">
           <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col gap-2">
               <h3 className="text-[13px] font-[1000] uppercase tracking-[0.2em] text-slate-900 dark:text-white">Seus Eventos</h3>
               <div className="w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_#10b981]"></div>
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-5 py-2.5 rounded-full border border-primary/10">{myEvents.length} Ativos</span>
          </div>

          <div className="space-y-6">
            {myEvents.length > 0 ? myEvents.map(event => (
              <div 
                key={event.id} 
                onClick={() => navigateTo('manage-event', event.id)} 
                className="group flex gap-6 p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-black/5 border border-slate-100 dark:border-white/5 cursor-pointer active:scale-[0.98] transition-all hover:border-primary/40 relative overflow-hidden"
              >
                <div className="shrink-0 size-24 rounded-3xl bg-cover bg-center shadow-inner overflow-hidden relative ring-1 ring-black/5">
                  <img src={event.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{event.type}</span>
                    <span className="size-1 bg-slate-200 dark:bg-zinc-800 rounded-full"></span>
                    <span className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">{event.status}</span>
                  </div>
                  <h4 className="text-[15px] font-[1000] leading-tight truncate uppercase text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tighter">{event.title}</h4>
                </div>
              </div>
            )) : (
              <div className="py-24 text-center bg-white dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center space-y-6 shadow-sm">
                <div className="size-20 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-200 dark:text-zinc-700">
                   <span className="material-symbols-outlined text-4xl">event_busy</span>
                </div>
                <div className="space-y-1">
                   <p className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Nenhum evento criado por você</p>
                   <button onClick={() => navigateTo('create-event')} className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline underline-offset-4">Iniciar Publicação Agora</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrganizerDashboard;
