
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
    <div className="relative flex flex-col w-full pb-32 bg-background-light dark:bg-background-dark min-h-screen animate-in fade-in duration-500">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top duration-300">
          Link copiado para a área de transferência!
        </div>
      )}

      {/* Imagem de Capa com Controles Flutuantes */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-black/30"></div>
        
        {/* Header Flutuante */}
        <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-30">
          <button 
            onClick={() => navigateTo('home')} 
            className="size-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined font-bold">arrow_back</span>
          </button>
          <button 
            onClick={handleShare}
            className="size-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined font-bold">share</span>
          </button>
        </div>

        {/* Badge de Categoria Flutuante */}
        <div className="absolute bottom-24 left-6 z-20">
          <span className="px-4 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/30">
            {event.type}
          </span>
        </div>
      </div>

      {/* Container de Conteúdo */}
      <main className="flex flex-col px-6 -mt-16 z-20 relative">
        {/* Card Principal de Título e Autor */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none mb-6">
          <h1 className="text-3xl font-black leading-tight text-zinc-900 dark:text-white tracking-tight mb-4">
            {event.title}
          </h1>
          
          <div className="flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Organização</p>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Pró-Reitoria de Pesquisa e Inovação</p>
            </div>
          </div>
        </div>

        {/* Dashboard de Informações Cruciais */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-3xl flex flex-col gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">calendar_today</span>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Data e Hora</p>
              <p className="text-xs font-black text-zinc-900 dark:text-white">{event.date}</p>
              <p className="text-[10px] font-bold text-zinc-500">{event.time.split(' - ')[0]}</p>
            </div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-3xl flex flex-col gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Localização</p>
              <p className="text-xs font-black text-zinc-900 dark:text-white truncate">{event.location}</p>
              <p className="text-[10px] font-bold text-zinc-500 truncate">{event.campus}</p>
            </div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-3xl flex flex-col gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Certificação</p>
              <p className="text-xs font-black text-zinc-900 dark:text-white">{event.certificateHours} Horas</p>
              <p className="text-[10px] font-bold text-zinc-500">Complementar</p>
            </div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-3xl flex flex-col gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">group</span>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vagas</p>
              <p className="text-xs font-black text-zinc-900 dark:text-white">Limitadas</p>
              <p className="text-[10px] font-bold text-zinc-500">Inscrição Prévia</p>
            </div>
          </div>
        </div>

        {/* Abas Modernas */}
        <div className="flex gap-8 border-b border-zinc-100 dark:border-zinc-800 mb-8">
          <button 
            onClick={() => setTab('sobre')}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tab === 'sobre' ? 'text-primary' : 'text-zinc-400'}`}
          >
            Sobre
            {tab === 'sobre' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in zoom-in"></div>}
          </button>
          <button 
            onClick={() => setTab('programacao')}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tab === 'programacao' ? 'text-primary' : 'text-zinc-400'}`}
          >
            Programação
            {tab === 'programacao' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in zoom-in"></div>}
          </button>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="min-h-[200px]">
          {tab === 'sobre' ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                {event.description}
              </p>
              
              {/* Botão de Compartilhamento Social no Conteúdo */}
              <div className="mt-8 flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Gostou do evento? Compartilhe!</h4>
                <div className="flex gap-3">
                  <button 
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                    Compartilhar
                  </button>
                </div>
              </div>

              <div className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Público Alvo</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700">Estudantes</span>
                  <span className="px-3 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700">Docentes</span>
                  <span className="px-3 py-1 bg-white dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700">Comunidade Externa</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              {[
                { time: '08:00', title: 'Credenciamento e Coffee', loc: 'Hall de Entrada' },
                { time: '09:00', title: 'Abertura Oficial', loc: 'Auditório Principal' },
                { time: '10:30', title: 'Conferência de Abertura', loc: 'Auditório Principal' },
                { time: '14:00', title: 'Mesa Redonda: Inovação no IFAL', loc: 'Bloco A' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="size-3 rounded-full bg-primary ring-4 ring-primary/20 group-hover:scale-125 transition-transform"></div>
                    <div className="w-[2px] flex-1 bg-zinc-100 dark:bg-zinc-800 my-2"></div>
                  </div>
                  <div className="pb-6">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.time}</span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1">{item.title}</h4>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-1">{item.loc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer de Ação Estilizado */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-100 dark:border-zinc-800 px-8 py-6 z-[100] max-w-md mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleShare}
            className="size-16 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all border border-zinc-200 dark:border-zinc-700"
          >
            <span className="material-symbols-outlined text-2xl">share</span>
          </button>
          <button 
            onClick={() => navigateTo('register', event.id)}
            className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
          >
            Inscrever-se
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
