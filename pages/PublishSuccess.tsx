
import React from 'react';
import { Event } from '../types';

/// Desenvolvido por Viktor Casado /// Projeto SIGEA – IFAL

interface PublishSuccessProps {
  navigateTo: (page: string, id?: string) => void;
  event: Event | undefined;
}

const PublishSuccess: React.FC<PublishSuccessProps> = ({ navigateTo, event }) => {
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] p-8 text-center">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Sincronizando Publicação...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] p-8 animate-in fade-in duration-1000 relative">
      {/* Liquid Glass Background Orbs */}
      <div className="absolute top-[-20%] left-[-20%] size-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative w-full max-w-sm flex flex-col items-center text-center">
        <div className="size-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] mb-8 animate-in zoom-in duration-500 delay-300">
          <span className="material-symbols-outlined text-white text-5xl font-black">check</span>
        </div>

        <h2 className="text-4xl font-[1000] text-white tracking-tighter leading-none uppercase mb-4">
          Evento <br /> <span className="text-primary">Publicado</span>
        </h2>
        
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed mb-10 px-6">
          Seu evento institucional foi processado e já está disponível para inscrições.
        </p>

        <div className="w-full liquid-glass rounded-[2.5rem] p-6 mb-10 text-left animate-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 border border-white/5">
            <img src={event.imageUrl} className="w-full h-full object-cover" alt="Banner" />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest">{event.type}</p>
            <h4 className="text-sm font-black text-white uppercase truncate tracking-tight leading-tight">{event.title}</h4>
            <div className="flex items-center gap-2 mt-2 text-zinc-500">
               <span className="material-symbols-outlined text-xs">location_on</span>
               <p className="text-[9px] font-bold uppercase tracking-widest truncate">{event.campus.replace('IFAL - Campus ', '')}</p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-4 animate-in fade-in duration-1000 delay-700">
          <button 
            onClick={() => navigateTo('details', event.id)}
            className="w-full h-18 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3"
          >
            Ver Página do Evento
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button 
            onClick={() => navigateTo('home')}
            className="w-full h-18 liquid-glass text-zinc-400 font-black rounded-2xl transition-all uppercase text-[10px] tracking-[0.2em] active:scale-95"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishSuccess;