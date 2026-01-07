
import React, { useState } from 'react';
import { Event } from '../types';

interface EventDetailsProps {
  navigateTo: (page: string, eventId?: string) => void;
  eventId: string | null;
  events: Event[];
}

const EventDetails: React.FC<EventDetailsProps> = ({ navigateTo, eventId, events }) => {
  const event = events.find(e => e.id === eventId) || events[0];
  const [tab, setTab] = useState<'sobre' | 'programacao'>('sobre');
  const [showToast, setShowToast] = useState(false);

  if (!event) return null;

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Confira este evento no SIGEA IFAL: ${event.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.log('Erro ao compartilhar:', err);
    }
  };

  return (
    <div className="relative flex flex-col w-full pb-32 bg-slate-50 dark:bg-zinc-950 min-h-screen animate-in fade-in duration-500">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top duration-300 ring-1 ring-white/10">
          Link copiado com sucesso!
        </div>
      )}

      {/* Imagem de Capa com Controles Flutuantes */}
      <div className="relative w-full h-[450px] overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-transparent to-black/40"></div>
        
        {/* Header Flutuante Liquid */}
        <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-30">
          <button 
            onClick={() => navigateTo('home')} 
            className="size-14 flex items-center justify-center rounded-[1.5rem] bg-white/20 backdrop-blur-xl border border-white/30 text-white active:scale-90 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </button>
          <button 
            onClick={handleShare}
            className="size-14 flex items-center justify-center rounded-[1.5rem] bg-white/20 backdrop-blur-xl border border-white/30 text-white active:scale-90 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined font-black">share</span>
          </button>
        </div>

        {/* Badge de Categoria Flutuante */}
        <div className="absolute bottom-24 left-6 z-20">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 ring-2 ring-white/20">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            {event.type}
          </div>
        </div>
      </div>

      {/* Container de Conteúdo */}
      <main className="flex flex-col px-6 -mt-16 z-20 relative max-w-4xl mx-auto w-full">
        {/* Card Principal Liquid Glass */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-10 shadow-2xl border border-white/50 dark:border-white/5 mb-6 ring-1 ring-black/5">
          <h1 className="text-3xl sm:text-4xl font-black leading-tight text-slate-900 dark:text-white tracking-tighter mb-6 uppercase">
            {event.title}
          </h1>
          
          <div className="flex items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-8">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
              <span className="material-symbols-outlined text-3xl">account_balance</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Responsável pelo Evento</p>
              <p className="text-[13px] font-black text-slate-800 dark:text-zinc-200 uppercase">{event.campus}</p>
            </div>
          </div>
        </div>

        {/* Informações em Grid Liquid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-3 border border-white/50 dark:border-white/5 shadow-lg">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Data</p>
              <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase leading-none">{event.date}</p>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-3 border border-white/50 dark:border-white/5 shadow-lg">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Horário</p>
              <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase leading-none">{event.time}</p>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-3 border border-white/50 dark:border-white/5 shadow-lg">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Local</p>
              <p className="text-[13px] font-black text-slate-900 dark:text-white truncate uppercase leading-none">{event.location}</p>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-3 border border-white/50 dark:border-white/5 shadow-lg">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Carga</p>
              <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase leading-none">{event.certificateHours} Horas</p>
            </div>
          </div>
        </div>

        {/* Abas Liquid */}
        <div className="flex gap-10 border-b border-slate-200 dark:border-white/5 mb-10 px-2">
          <button 
            onClick={() => setTab('sobre')}
            className={`pb-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${tab === 'sobre' ? 'text-primary' : 'text-slate-400'}`}
          >
            Apresentação
            {tab === 'sobre' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in zoom-in shadow-[0_0_8px_#10b981]"></div>}
          </button>
          <button 
            onClick={() => setTab('programacao')}
            className={`pb-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${tab === 'programacao' ? 'text-primary' : 'text-slate-400'}`}
          >
            Cronograma
            {tab === 'programacao' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in zoom-in shadow-[0_0_8px_#10b981]"></div>}
          </button>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="min-h-[300px]">
          {tab === 'sobre' ? (
            <div className="animate-in fade-in slide-in-from-left-6 duration-500">
              <p className="text-[15px] leading-[1.8] text-slate-600 dark:text-zinc-400 font-bold">
                {event.description}
              </p>
              
              <div className="mt-12 p-10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[3rem] border border-white dark:border-white/5 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                   <span className="material-symbols-outlined text-primary">diversity_3</span>
                   <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Participantes Alvo</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-[10px] font-black text-slate-500 dark:text-zinc-400 rounded-2xl border border-white dark:border-white/5 uppercase tracking-widest transition-all hover:bg-primary/10 hover:text-primary">Discentes</span>
                  <span className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-[10px] font-black text-slate-500 dark:text-zinc-400 rounded-2xl border border-white dark:border-white/5 uppercase tracking-widest transition-all hover:bg-primary/10 hover:text-primary">Servidores</span>
                  <span className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-[10px] font-black text-slate-500 dark:text-zinc-400 rounded-2xl border border-white dark:border-white/5 uppercase tracking-widest transition-all hover:bg-primary/10 hover:text-primary">Sociedade</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-6 duration-500 space-y-8 px-2">
              {[
                { time: '08:00', title: 'Abertura Institucional', loc: 'Plenário Principal' },
                { time: '10:00', title: 'Palestra Magna', loc: 'Auditório 01' },
                { time: '14:00', title: 'Workshops e Atividades Práticas', loc: 'Laboratórios' },
                { time: '17:00', title: 'Encerramento e Networking', loc: 'Hall Social' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="size-4 rounded-full bg-primary ring-8 ring-primary/10 group-hover:scale-125 transition-transform duration-500 shadow-[0_0_12px_#10b981]"></div>
                    <div className="w-[3px] flex-1 bg-slate-200 dark:bg-zinc-800/50 my-3 rounded-full"></div>
                  </div>
                  <div className="pb-8">
                    <span className="text-[12px] font-black text-primary uppercase tracking-[0.2em]">{item.time}</span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-2 text-slate-400 dark:text-zinc-500">
                       <span className="material-symbols-outlined text-[16px]">room</span>
                       <p className="text-[10px] font-black uppercase tracking-[0.15em]">{item.loc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer de Ação Estilizado Liquid */}
      <div className="fixed bottom-0 left-0 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-3xl border-t border-white/20 dark:border-white/5 px-8 py-8 z-[100] shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-5 max-w-4xl mx-auto">
          <button 
            onClick={handleShare}
            className="size-16 flex items-center justify-center rounded-[1.8rem] bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 active:scale-95 transition-all border border-slate-200 dark:border-white/5 shadow-xl"
          >
            <span className="material-symbols-outlined text-2xl font-black">share_windows</span>
          </button>
          <button 
            onClick={() => navigateTo('register', event.id)}
            className="flex-1 h-16 bg-primary text-white font-black rounded-[1.8rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 border border-white/20"
          >
            Garantir Minha Vaga
            <span className="material-symbols-outlined text-2xl">arrow_forward_ios</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
