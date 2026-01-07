
import React, { useState } from 'react';
import { Event } from '../types';

interface ManageEventProps {
  navigateTo: (page: string) => void;
  eventId: string | null;
  events: Event[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const ManageEvent: React.FC<ManageEventProps> = ({ navigateTo, eventId, events, onDelete, onArchive }) => {
  const event = events.find(e => e.id === eventId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadList = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("Lista de participantes gerada com sucesso e pronta para download!");
    }, 2000);
  };

  const handleDelete = () => {
    if (event && confirm(`Deseja realmente EXCLUIR PERMANENTEMENTE o evento "${event.title}"?\nEsta ação removerá todos os dados de inscrições e não poderá ser desfeita.`)) {
      onDelete(event.id);
    }
  };

  const handleArchive = () => {
    if (event && confirm("Deseja arquivar este evento? Ele não aparecerá mais para novas inscrições, mas os certificados emitidos continuarão válidos.")) {
      onArchive(event.id);
    }
  };

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen p-6 text-center bg-background-light dark:bg-background-dark">
        <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-400">error</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Evento não encontrado</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-xs">O evento que você está tentando gerenciar pode ter sido excluído ou você não tem permissão para acessá-lo.</p>
        <button 
          onClick={() => navigateTo('home')}
          className="px-8 py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-32 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between shadow-sm transition-colors">
        <button onClick={() => navigateTo('home')} className="size-11 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Gerenciar Evento</h2>
        <button className="size-11 flex items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined">edit</span>
        </button>
      </header>

      <main className="p-5 space-y-8">
        {/* Banner Card */}
        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-5 shadow-xl border-2 border-slate-200 dark:border-slate-800 space-y-5">
          <div className="aspect-video w-full rounded-3xl bg-cover bg-center overflow-hidden relative shadow-inner group" style={{backgroundImage: `url(${event.imageUrl})`}}>
            <div className={`absolute top-4 right-4 px-4 py-1.5 text-white text-[10px] font-black rounded-full uppercase shadow-2xl backdrop-blur-md z-10 ${event.status === 'Inscrições Abertas' ? 'bg-green-600/80' : 'bg-primary/80'}`}>
              {event.status}
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
          </div>
          <div className="px-2">
            <h1 className="text-2xl font-black leading-tight mb-4 text-slate-900 dark:text-white tracking-tight">{event.title}</h1>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                {event.date} • {event.time}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                {event.campus}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-white/5 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-primary">
              <span className="material-symbols-outlined text-[22px]">group</span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inscritos</span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">1,250</p>
            <p className="text-[9px] font-bold mt-1 text-green-500">+12% hoje</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-white/5 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-primary">
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Check-ins</span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">850</p>
            <p className="text-[9px] font-bold mt-1 text-slate-400">68% total</p>
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Ações Administrativas</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleDownloadList}
              disabled={isDownloading}
              className="w-full flex items-center justify-between p-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className={`material-symbols-outlined text-2xl ${isDownloading ? 'animate-bounce' : ''}`}>file_download</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Lista de Presença</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isDownloading ? 'Gerando...' : 'Exportar em PDF'}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>

            <button 
              onClick={() => navigateTo('check-in')}
              className="w-full flex items-center justify-between p-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Iniciar Check-in</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scanner de QR Code</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 px-2">Zona de Perigo</h3>
          <div className="bg-red-50 dark:bg-red-900/5 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/20 p-8 space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-tight">Arquivar Evento</h4>
              <p className="text-[10px] text-red-400 font-bold uppercase leading-relaxed tracking-wider">
                O evento sairá da lista pública mas continuará acessível para gestão histórica.
              </p>
              <button 
                onClick={handleArchive}
                className="w-full mt-2 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 text-red-600 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                Arquivar Agora
              </button>
            </div>

            <div className="h-[1px] w-full bg-red-100 dark:bg-red-900/20"></div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-tight">Excluir Permanente</h4>
              <p className="text-[10px] text-red-400 font-bold uppercase leading-relaxed tracking-wider">
                Atenção: Todos os dados serão perdidos. Esta ação é irreversível.
              </p>
              <button 
                onClick={handleDelete}
                className="w-full mt-2 py-5 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all hover:bg-red-700"
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageEvent;
