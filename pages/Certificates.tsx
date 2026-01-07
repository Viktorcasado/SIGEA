
import React, { useState } from 'react';
import { Event, Certificate } from '../types';

interface CertificatesProps {
  navigateTo: (page: string) => void;
  events: Event[];
}

const Certificates: React.FC<CertificatesProps> = ({ navigateTo }) => {
  const [certificates] = useState<Certificate[]>([]);

  return (
    <div className="flex flex-col w-full pb-24 min-h-screen bg-background-light dark:bg-zinc-950">
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl px-6 py-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateTo('home')} 
            className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 active:scale-90 transition-all hover:text-white"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[14px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white leading-none">Meus Certificados</h1>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">IFAL Academic Records</p>
          </div>
        </div>
        <button className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500">
          <span className="material-symbols-outlined">help</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        {certificates.length === 0 ? (
          <div className="animate-in zoom-in duration-700 space-y-6">
            <div className="size-32 rounded-[2.5rem] bg-zinc-900 flex items-center justify-center mx-auto border-2 border-dashed border-white/5">
               <span className="material-symbols-outlined text-zinc-800 text-[64px]">workspace_premium</span>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-[900] text-zinc-400 uppercase tracking-[0.25em] leading-relaxed max-w-[200px] mx-auto">
                Ainda não há certificados registrados.
              </p>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Participe de eventos para pontuar</p>
            </div>
            <button 
              onClick={() => navigateTo('events')}
              className="px-8 py-4 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Explorar Eventos
            </button>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {/* Listagem de certificados futura */}
          </div>
        )}
      </main>
    </div>
  );
};

export default Certificates;
