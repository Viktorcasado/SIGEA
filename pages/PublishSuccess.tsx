
import React, { useMemo } from 'react';
import { Event } from '../types';

interface PublishSuccessProps {
  navigateTo: (page: string, id?: string) => void;
  event: Event | undefined;
}

const PublishSuccess: React.FC<PublishSuccessProps> = ({ navigateTo, event: eventFromProps }) => {
  // Tenta encontrar o evento nos props ou no localStorage como plano B
  const event = useMemo(() => {
    if (eventFromProps) return eventFromProps;
    
    // Procura por qualquer evento recém-publicado no cache local
    const lastId = localStorage.getItem('sigea_last_event_id');
    if (lastId) {
      const cached = localStorage.getItem(`last_published_${lastId}`);
      if (cached) return JSON.parse(cached) as Event;
    }
    return undefined;
  }, [eventFromProps]);

  const copyLink = () => {
    if (!event) return;
    const link = `https://sigea.ifal.edu.br/evento/${event.id}`;
    navigator.clipboard.writeText(link);
    alert("Link institucional copiado!");
  };

  // Se mesmo com o fallback não encontrarmos, exibimos um estado de erro/ação manual
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#09090b] p-8 text-center">
        <div className="size-20 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400 mb-6">
          <span className="material-symbols-outlined text-4xl">sync_problem</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Processando Evento</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Seu evento foi enviado, mas os dados estão sendo sincronizados. Você pode voltar ao dashboard para acompanhá-lo.</p>
        <button 
          onClick={() => navigateTo('home')}
          className="px-10 py-5 bg-primary text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#09090b] p-8 animate-in fade-in duration-700">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] size-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] size-96 bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center text-center space-y-8">
        {/* Animated Checkmark */}
        <div className="relative size-32">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping duration-[3s]"></div>
          <div className="relative size-32 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 animate-in zoom-in duration-500 delay-300">
            <span className="material-symbols-outlined text-white text-6xl font-black">check</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight uppercase">
            Evento <br /> <span className="text-primary">Publicado!</span>
          </h2>
          <p className="text-sm font-medium text-zinc-500 leading-relaxed px-4">
            Parabéns! Seu evento já está disponível para inscrições em toda a rede do IFAL.
          </p>
        </div>

        {/* Share Card Preview */}
        <div className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-xl border border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-bottom-10 duration-700 delay-500">
          <div className="aspect-video w-full rounded-2xl bg-cover bg-center mb-4 border border-slate-100 dark:border-white/5" style={{backgroundImage: `url(${event.imageUrl})`}}></div>
          <div className="text-left space-y-1 mb-6">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest">{event.type}</p>
            <h4 className="text-sm font-black text-zinc-900 dark:text-white truncate uppercase tracking-tight">{event.title}</h4>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">calendar_today</span> {event.date} • {event.campus}
            </p>
          </div>
          
          <button 
            onClick={copyLink}
            className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">link</span>
            Copiar Link do Evento
          </button>
        </div>

        <div className="w-full space-y-3 pt-6 animate-in fade-in duration-1000 delay-700">
          <button 
            onClick={() => navigateTo('home')}
            className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase text-[10px] tracking-[0.2em]"
          >
            Ir para o Dashboard
          </button>
          <button 
            onClick={() => navigateTo('manage-event', event.id)}
            className="w-full py-4 text-zinc-500 dark:text-zinc-400 font-black rounded-2xl transition-all uppercase text-[9px] tracking-[0.2em] border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
          >
            Ver Detalhes do Gerenciamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishSuccess;
