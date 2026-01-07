
import React, { useMemo } from 'react';
import { Event } from '../types';
import IfalLogo from '../components/IfalLogo.tsx';

interface MyTicketProps {
  navigateTo: (page: string) => void;
  profile: { id: string; name: string; email: string; campus: string };
  event: Event;
}

const MyTicket: React.FC<MyTicketProps> = ({ navigateTo, profile, event }) => {
  const timestamp = useMemo(() => new Date().getTime(), []);
  
  // Gera um hash único para este ticket específico (combinação de evento, usuário e tempo)
  const ticketId = useMemo(() => {
    const raw = `SIGEA|${event.id}|${profile.id}|${timestamp}`;
    return btoa(raw).substring(0, 12).toUpperCase();
  }, [event.id, profile.id, timestamp]);

  const qrColor = "10b981"; // Cor primary em hex (sem # para a API)
  const qrData = `SIGEA|EVENT:${event.id}|USER:${profile.id}|AUTH:${ticketId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&color=${qrColor}&bgcolor=ffffff&qzone=2&margin=10`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-zinc-950 pb-20 animate-in fade-in duration-500 print:bg-white">
      {/* Header - Escondido na impressão se desejar, mas aqui mantemos para contexto */}
      <header className="p-6 flex items-center justify-between print:hidden">
        <button onClick={() => navigateTo('home')} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Comprovante Digital</h2>
          <p className="text-[8px] font-bold text-primary uppercase tracking-widest">Inscrição Confirmada</p>
        </div>
        <div className="size-11"></div>
      </header>

      <main className="flex-1 px-6 pt-4 pb-12 flex flex-col items-center">
        {/* O Ticket/Comprovante */}
        <div className="w-full max-w-[360px] flex flex-col shadow-2xl print:shadow-none animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Parte Superior: Cabeçalho Institucional */}
          <div className="bg-white dark:bg-zinc-900 rounded-t-[2.5rem] p-8 border-x border-t border-zinc-100 dark:border-white/5 relative">
            <div className="flex justify-between items-start mb-8">
              <IfalLogo className="h-10" />
              <div className="text-right">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">ID do Ticket</p>
                <p className="text-[10px] font-black text-zinc-900 dark:text-white">#{ticketId}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">{event.type}</p>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase leading-tight tracking-tighter">
                  {event.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-zinc-50 dark:border-white/5">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-zinc-300 text-lg">person</span>
                  <div>
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Participante</p>
                    <p className="text-xs font-black text-zinc-900 dark:text-white">{profile.name}</p>
                    <p className="text-[9px] font-medium text-zinc-500">{profile.campus}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-zinc-300 text-lg">event_available</span>
                  <div>
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Realização</p>
                    <p className="text-xs font-black text-zinc-900 dark:text-white">{event.date} • {event.time}</p>
                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-tight">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Círculos de corte laterais */}
            <div className="absolute -bottom-4 -left-4 size-8 bg-background-light dark:bg-zinc-950 rounded-full border-r border-zinc-100 dark:border-white/5 print:hidden"></div>
            <div className="absolute -bottom-4 -right-4 size-8 bg-background-light dark:bg-zinc-950 rounded-full border-l border-zinc-100 dark:border-white/5 print:hidden"></div>
          </div>

          {/* Divisor Serrilhado */}
          <div className="bg-white dark:bg-zinc-900 h-1 border-x border-zinc-100 dark:border-white/5 flex items-center justify-center relative overflow-hidden">
            <div className="w-full border-t-2 border-dashed border-zinc-100 dark:border-zinc-800 mx-4"></div>
          </div>

          {/* Parte Inferior: QR Code e Autenticação */}
          <div className="bg-white dark:bg-zinc-900 rounded-b-[2.5rem] p-10 border-x border-b border-zinc-100 dark:border-white/5 flex flex-col items-center text-center">
            
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-[2.5rem] mb-6 shadow-inner ring-1 ring-zinc-100 dark:ring-white/5 group transition-all">
              <img 
                src={qrUrl} 
                alt="QR Code de Inscrição" 
                className="size-48 object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.3em]">Check-in Obrigatório</p>
              <p className="text-[9px] font-medium text-zinc-500 leading-relaxed max-w-[200px]">
                Apresente este código na entrada do evento para garantir suas horas complementares.
              </p>
              
              <div className="mt-4 pt-4 border-t border-zinc-50 dark:border-white/5 flex items-center justify-center gap-6">
                <div>
                  <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Carga Horária</p>
                  <p className="text-[10px] font-black text-primary">{event.certificateHours}h</p>
                </div>
                <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-800"></div>
                <div>
                  <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Autenticação</p>
                  <p className="text-[10px] font-black text-zinc-900 dark:text-white">SIGEA-V1</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações do Usuário */}
        <div className="mt-10 w-full max-w-[360px] flex flex-col gap-4 print:hidden">
          <button 
            onClick={handlePrint}
            className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">print</span>
            Imprimir Comprovante
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="h-14 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">download</span>
              PDF
            </button>
            <button className="h-14 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">share</span>
              Compartilhar
            </button>
          </div>
          
          <p className="text-center text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-4">
            Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </main>
    </div>
  );
};

export default MyTicket;
