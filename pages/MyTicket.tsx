
import React, { useMemo, useState } from 'react';
import { Event } from '../types';
import IfalLogo from '../components/IfalLogo.tsx';

interface MyTicketProps {
  navigateTo: (page: string) => void;
  profile: { id: string; name: string; email: string; campus: string };
  event: Event | undefined;
}

const MyTicket: React.FC<MyTicketProps> = ({ navigateTo, profile, event }) => {
  const [walletLoading, setWalletLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const timestamp = useMemo(() => new Date().getTime(), []);
  
  const ticketId = useMemo(() => {
    if (!event) return 'N/A';
    const raw = `SIGEA|${event.id}|${profile.id}|${timestamp}`;
    return btoa(raw).substring(0, 12).toUpperCase();
  }, [event?.id, profile.id, timestamp]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 text-center">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Voucher...</p>
      </div>
    );
  }

  const qrColor = "10b981";
  const qrData = `SIGEA|EVENT:${event.id}|USER:${profile.id}|AUTH:${ticketId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData)}&color=${qrColor}&bgcolor=ffffff&qzone=2&margin=10`;

  const handleDownloadQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SIGEA-QR-CODE-${ticketId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Erro ao baixar o QR Code. Tente tirar um print da tela.");
    } finally {
      setDownloading(false);
    }
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(`${event.location}, ${event.campus}`);
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&sf=true&output=xml`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 animate-in fade-in duration-500">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-xl z-50">
        <button onClick={() => navigateTo('home')} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl active:scale-90 transition-all"><span className="material-symbols-outlined font-black">arrow_back</span></button>
        <div className="text-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Voucher Digital</h2>
          <p className="text-[8px] font-bold text-primary uppercase mt-0.5">Credencial Homologada</p>
        </div>
        <div className="size-12"></div>
      </header>

      <main className="flex-1 px-6 pt-4 pb-12 flex flex-col items-center">
        <div className="w-full max-w-[360px] flex flex-col shadow-2xl rounded-apple overflow-hidden">
          <div className="bg-white dark:bg-zinc-900 p-8 border-b-2 border-dashed border-slate-100 dark:border-zinc-800 relative">
            <div className="flex justify-between items-start mb-8">
              <IfalLogo className="h-9" />
              <div className="text-right"><p className="text-[8px] font-black text-zinc-400 uppercase">Ticket ID</p><p className="text-[10px] font-black text-primary">#{ticketId}</p></div>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{event.type}</p>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase leading-tight tracking-tighter line-clamp-2">{event.title}</h3>
              <div className="grid gap-3 pt-4 border-t border-slate-50 dark:border-white/5">
                <div className="flex gap-3"><span className="material-symbols-outlined text-zinc-300 text-lg">person</span><div><p className="text-[8px] font-black text-zinc-400 uppercase">Participante</p><p className="text-xs font-black text-zinc-900 dark:text-white uppercase truncate">{profile.name}</p></div></div>
                <div className="flex gap-3"><span className="material-symbols-outlined text-zinc-300 text-lg">calendar_month</span><div><p className="text-[8px] font-black text-zinc-400 uppercase">Local e Data</p><p className="text-xs font-black text-zinc-900 dark:text-white uppercase truncate">{event.date} • {event.time}</p><p className="text-[9px] font-bold text-zinc-500 uppercase">{event.location}</p></div></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-10 flex flex-col items-center text-center">
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[2.5rem] mb-8 shadow-inner ring-1 ring-slate-200 dark:ring-white/5">
              <img src={qrUrl} alt="QR Code" className="size-48 object-contain dark:invert" />
            </div>
            <button 
              onClick={handleDownloadQR}
              disabled={downloading}
              className="w-full h-14 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all mb-4"
            >
              {downloading ? <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> : <><span className="material-symbols-outlined text-xl">download</span> Baixar QR Code</>}
            </button>
            <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed">Apresente no check-in para validar sua presença e carga horária.</p>
          </div>
        </div>

        <div className="mt-8 w-full max-w-[360px] space-y-4">
          <button onClick={handleAddToCalendar} className="w-full h-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center gap-4 text-slate-700 dark:text-white font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"><span className="material-symbols-outlined text-blue-500">calendar_add_on</span> Agendar no Google</button>
          <button onClick={() => window.print()} className="w-full h-14 bg-zinc-950 text-white font-black rounded-2xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest active:scale-95 transition-all"><span className="material-symbols-outlined">print</span> Imprimir Voucher</button>
        </div>
      </main>
    </div>
  );
};

export default MyTicket;
