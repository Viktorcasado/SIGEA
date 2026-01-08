
import React, { useState } from 'react';
import { Event } from '../types.ts';
import { supabase, handleSupabaseError, isSupabaseConfigured } from '../supabaseClient.ts';

interface ManageEventProps {
  navigateTo: (page: string) => void;
  eventId: string | null;
  events: Event[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const ManageEvent: React.FC<ManageEventProps> = ({ navigateTo, eventId, events, onDelete, onArchive }) => {
  const event = events.find(e => e.id === eventId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAction = async () => {
    if (!event) return;
    setIsDeleting(true);
    
    try {
      const isDemo = localStorage.getItem('sigea_demo') === 'true';

      if (!isDemo && isSupabaseConfigured()) {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', event.id);
        
        if (error) throw error;
      }

      // Se for demo ou se o banco deletou com sucesso
      onDelete(event.id);
      setShowDeleteModal(false);
    } catch (err: any) {
      const msg = handleSupabaseError(err);
      console.error("Erro na deleção:", msg);
      
      if (localStorage.getItem('sigea_demo') === 'true') {
        onDelete(event.id);
        setShowDeleteModal(false);
      } else {
        alert(`Não foi possível excluir o evento: ${msg}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen p-6 text-center bg-slate-50 dark:bg-[#09090b]">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">event_busy</span>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">Evento não encontrado</h2>
        <button onClick={() => navigateTo('home')} className="mt-6 px-8 py-4 bg-primary text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl">Voltar ao Início</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-[#09090b] pb-32 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <button onClick={() => navigateTo('home')} className="size-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Gerenciamento</h2>
          <p className="text-[9px] font-bold text-primary uppercase mt-1 tracking-widest">ID: {event.id.slice(0,8)}</p>
        </div>
        <button onClick={() => setShowDeleteModal(true)} className="size-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 active:scale-90 transition-all border border-red-500/10 shadow-sm">
          <span className="material-symbols-outlined">delete</span>
        </button>
      </header>

      <main className="p-6 space-y-8">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-2xl border border-slate-200 dark:border-white/5 space-y-6">
          <div className="aspect-video w-full rounded-3xl overflow-hidden relative shadow-inner">
             <img src={event.imageUrl} className="w-full h-full object-cover" alt={event.title} />
            <div className="absolute top-4 right-4 px-4 py-2 bg-primary/90 text-white text-[9px] font-black rounded-full uppercase backdrop-blur-md">
              {event.status}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{event.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl text-center">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Inscritos</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white">1.250</p>
          </div>
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl text-center">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Check-ins</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white">850</p>
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMAÇÃO (CONFORME IMAGEM) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => !isDeleting && setShowDeleteModal(false)}></div>
          <div className="relative w-full max-w-sm bg-[#09090b] rounded-[3.5rem] p-10 flex flex-col items-center text-center shadow-[0_0_100px_rgba(239,68,68,0.15)] border border-white/5">
            
            {/* ÍCONE DE ALERTA */}
            <div className="size-28 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/80 mb-8 border border-red-500/20">
              <span className="material-symbols-outlined text-[64px]">warning</span>
            </div>

            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">EXCLUIR EVENTO?</h3>
            <p className="text-[11px] font-bold text-zinc-500 leading-relaxed mb-12 px-2 uppercase tracking-tight">
              ESTA AÇÃO É IRREVERSÍVEL E APAGARÁ PERMANENTEMENTE TODOS OS REGISTROS INSTITUCIONAIS DESTE EVENTO DO SIGEA.
            </p>
            
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={handleDeleteAction}
                disabled={isDeleting}
                className="w-full h-18 bg-[#ef4444] text-white font-black rounded-2xl uppercase text-[11px] tracking-widest shadow-2xl shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isDeleting ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "SIM, EXCLUIR AGORA"}
              </button>
              
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-full h-18 bg-[#18181b] text-zinc-400 font-black rounded-2xl uppercase text-[11px] tracking-widest active:scale-95 transition-all hover:bg-[#27272a] hover:text-white"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvent;
