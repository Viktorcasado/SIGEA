
import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { Event } from '../types';
import { supabase } from '../supabaseClient';

interface OrganizerDashboardProps {
  navigateTo: (page: string, id?: string) => void;
  onNotify: () => void;
  profile: { name: string, photo: string };
  events: Event[];
  unreadNotifications: number;
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ navigateTo, onNotify, profile, events, unreadNotifications }) => {
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setTotalParticipants(count);
      }
      setLoadingStats(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      {/* Header Premium com Gradiente Suave */}
      <header className="relative pt-8 pb-6 px-6 bg-gradient-to-b from-white to-slate-50 dark:from-[#1e293b] dark:to-[#0f172a] rounded-b-[2.5rem] shadow-sm z-30">
        <div className="flex justify-center mb-6">
          <Logo className="h-10" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bem-vindo de volta,</p>
            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
              {profile.name.split(' ')[0]} 👋
            </h1>
          </div>
          <button
            onClick={onNotify}
            className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 relative active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-3 right-3.5 size-2 bg-red-500 rounded-full border border-white dark:border-slate-800 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Stats Widgets - Mais Visuais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-24 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-blue-500 text-2xl mb-2">calendar_month</span>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{events.length}</p>
            </div>
            <p className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Eventos Ativos</p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-24 bg-green-50 dark:bg-green-900/20 rounded-full transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-green-500 text-2xl mb-2">groups</span>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {loadingStats ? "..." : totalParticipants}
              </p>
            </div>
            <p className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Inscritos</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-8">

        {/* Ações Rápidas - Estilo "App Grid" */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">Acesso Rápido</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => navigateTo('create-event')} className="flex flex-col items-center gap-2 group">
              <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 transition-transform group-active:scale-95">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Novo<br />Evento</span>
            </button>

            <button onClick={() => navigateTo('check-in')} className="flex flex-col items-center gap-2 group">
              <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm transition-transform group-active:scale-95">
                <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Check-in</span>
            </button>

            <button onClick={() => navigateTo('certificates')} className="flex flex-col items-center gap-2 group">
              <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm transition-transform group-active:scale-95">
                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Certificados</span>
            </button>

            <button onClick={() => navigateTo('reports')} className="flex flex-col items-center gap-2 group">
              <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm transition-transform group-active:scale-95">
                <span className="material-symbols-outlined text-2xl">bar_chart</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Relatórios</span>
            </button>
          </div>
        </section>

        {/* Lista de Eventos - Redesign Clean */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">Gerenciar Eventos</h3>
            <button onClick={() => navigateTo('events')} className="text-[10px] font-black text-primary uppercase tracking-widest">Ver Todos</button>
          </div>

          <div className="space-y-4">
            {events.slice(0, 5).map(event => (
              <div
                key={event.id}
                onClick={() => navigateTo('manage-event', event.id)}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 overflow-hidden transition-all active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-slate-300">edit</span>
                </div>

                <div className="shrink-0 size-20 rounded-xl bg-slate-100 dark:bg-slate-700 bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})` }}></div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[9px] font-black uppercase text-slate-500 mb-1">
                    <span className="material-symbols-outlined text-[10px]">event</span> {event.date}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight mb-1 truncate">{event.title}</h4>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-slate-400">location_on</span>
                    <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{event.campus}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default OrganizerDashboard;
