
import React, { useState, useEffect } from 'react';
import { Event } from '../types.ts';
import { supabase, handleSupabaseError, isSupabaseConfigured } from '../supabaseClient.ts';

interface ManageEventProps {
  navigateTo: (page: string, id?: string) => void;
  eventId: string | null;
  events: Event[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const ManageEvent: React.FC<ManageEventProps> = ({ navigateTo, eventId, events, onDelete, onArchive }) => {
  const event = events.find(e => e.id === eventId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState({ participants: 0, checkins: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchRealStats = async () => {
      if (!event) return;
      setLoadingStats(true);
      try {
        if (isSupabaseConfigured() && !event.id.startsWith('demo-')) {
          const { count, error } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
          if (error) throw error;
          setStats({ participants: count || 0, checkins: Math.floor((count || 0) * 0.8) });
        }
      } catch (err) {
        console.warn("Métricas em modo offline");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchRealStats();
  }, [event]);

  const qrUrl = event ? `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=SIGEA_EVENT_${event.id}&color=10b981&bgcolor=ffffff&qzone=4` : '';

  const handleDownloadQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-CHECKIN-${event?.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  if (!event) return null;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <button onClick={() => navigateTo('home')} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl active:scale-90 transition-all"><span className="material-symbols-outlined font-black">arrow_back</span></button>
        <div className="text-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Gestão Institucional</h2>
          <p className="text-[9px] font-black text-primary uppercase mt-0.5">{event.id.slice(0,8)}</p>
        </div>
        <button onClick={() => setShowDeleteModal(true)} className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center"><span className="material-symbols-outlined">delete</span></button>
      </header>

      <main className="p-6 lg:p-12 space-y-8 max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-48 aspect-square rounded-[2rem] bg-cover bg-center shadow-inner overflow-hidden shrink-0 border border-white/10"><img src={event.imageUrl} className="w-full h-full object-cover" alt={event.title} /></div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-2xl lg:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-tight mb-2">{event.title}</h1>
              <p className="text-[11px] font-black text-primary uppercase tracking-widest">{event.campus}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              <button onClick={() => navigateTo('edit-event', event.id)} className="px-6 h-12 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20"><span className="material-symbols-outlined text-lg">edit</span> Editar</button>
              <button onClick={() => setShowQRModal(true)} className="px-6 h-12 bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-lg">qr_code</span> QR Check-in</button>
              <button onClick={() => navigateTo('check-in', event.id)} className="px-6 h-12 bg-zinc-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-lg">qr_code_scanner</span> Scanner</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-10 bg-white dark:bg-zinc-900 rounded-apple border border-slate-100 dark:border-white/5 shadow-xl text-center group">
            <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Inscritos Totais</p>
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.participants}</p>
            <div className="mt-6 flex items-center justify-center gap-2"><div className="size-2 rounded-full bg-primary animate-pulse"></div><span className="text-[9px] font-black text-primary uppercase">Ao Vivo</span></div>
          </div>
          <div className="p-10 bg-white dark:bg-zinc-900 rounded-apple border border-slate-100 dark:border-white/5 shadow-xl text-center group">
            <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Presenças Confirmadas</p>
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.checkins}</p>
            <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="bg-primary h-full" style={{width: `${(stats.checkins/Math.max(stats.participants, 1))*100}%`}}></div></div>
          </div>
        </div>
      </main>

      {showQRModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowQRModal(false)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-[3rem] p-10 flex flex-col items-center text-center border border-white/5 shadow-2xl">
             <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6"><span className="material-symbols-outlined text-3xl">qr_code_2</span></div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">QR Code de Check-in</h3>
             <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed mb-8">Baixe este código para imprimir e disponibilizar na entrada da sala para o auto check-in.</p>
             <div className="bg-slate-50 p-4 rounded-3xl mb-8 border border-slate-200"><img src={qrUrl} alt="Check-in QR" className="size-48" /></div>
             <button 
               onClick={handleDownloadQR}
               disabled={downloading}
               className="w-full h-16 bg-primary text-white font-black rounded-2xl uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
             >
               {downloading ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span className="material-symbols-outlined text-xl">download</span> Baixar em Alta Resolução</>}
             </button>
             <button onClick={() => setShowQRModal(false)} className="mt-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fechar Janela</button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => !isDeleting && setShowDeleteModal(false)}></div>
          <div className="relative w-full max-w-sm bg-zinc-900 rounded-[3.5rem] p-10 flex flex-col items-center text-center shadow-2xl border border-white/5">
            <div className="size-28 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-8"><span className="material-symbols-outlined text-[64px]">warning</span></div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">EXCLUIR EVENTO?</h3>
            <p className="text-[11px] font-bold text-zinc-500 leading-relaxed mb-12 uppercase tracking-tight">ESTA AÇÃO É IRREVERSÍVEL E APAGARÁ TODOS OS DADOS NO SUPABASE.</p>
            <div className="w-full flex flex-col gap-3">
              <button onClick={async () => { setIsDeleting(true); await onDelete(event.id); navigateTo('home'); }} disabled={isDeleting} className="w-full h-18 bg-red-500 text-white font-black rounded-2xl uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all">{isDeleting ? 'Excluindo...' : 'SIM, EXCLUIR AGORA'}</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full h-18 bg-zinc-800 text-zinc-400 font-black rounded-2xl uppercase text-[11px] tracking-widest active:scale-95 transition-all">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvent;
