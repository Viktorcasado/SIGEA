
import React, { useMemo, useState } from 'react';
import { Event } from '../types';
import IfalLogo from '../components/IfalLogo.tsx';
import { INSTITUTION_CONTACTS } from '../constants';

interface MyTicketProps {
  navigateTo: (page: string) => void;
  profile: { id: string; name: string; email: string; campus: string };
  event: Event | undefined;
}

const MyTicket: React.FC<MyTicketProps> = ({ navigateTo, profile, event }) => {
  const [downloading, setDownloading] = useState(false);
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  
  const timestamp = useMemo(() => new Date().getTime(), []);
  
  const ticketId = useMemo(() => {
    if (!event) return 'N/A';
    const raw = `SIGEA|${event.id}|${profile.id}|${timestamp}`;
    return btoa(raw).substring(0, 12).toUpperCase();
  }, [event?.id, profile.id, timestamp]);

  if (!event) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 text-center z-[1000]">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Voucher...</p>
      </div>
    );
  }

  const qrColor = "10b981";
  const qrData = `SIGEA|EVENT:${event.id}|USER:${profile.id}|AUTH:${ticketId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrData)}&color=${qrColor}&bgcolor=ffffff&qzone=2&margin=10`;

  /**
   * Integração Google Agenda v3
   * @param calendarId Parâmetro string (ex: 'primary' ou email da conta)
   */
  const handleAddToCalendar = (calendarId: string = "primary") => {
    setCalendarSyncing(true);
    if (window.navigator.vibrate) window.navigator.vibrate(25);

    const title = encodeURIComponent(`[IFAL] ${event.title}`);
    const details = encodeURIComponent(
      `📌 Voucher Digital: ${ticketId}\n` +
      `🏛️ Unidade: ${event.campus}\n` +
      `📍 Local: ${event.location}\n\n` +
      `Inscrito: ${profile.name}\n` +
      `Gerado via SIGEA Mobile.`
    );
    const location = encodeURIComponent(`${event.location}, ${event.campus}`);
    
    // URL Estruturada Calendar v3
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&ctz=America/Maceio&src=${calendarId}`;
    
    window.open(googleCalendarUrl, '_blank');
    
    setTimeout(() => setCalendarSyncing(false), 1500);
  };

  const handleDownloadQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SIGEA-QR-${ticketId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Erro ao baixar QR Code.");
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const openMaps = () => {
    const coords = INSTITUTION_CONTACTS[event.campus]?.coords;
    const query = coords || encodeURIComponent(`${event.location}, ${event.campus}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-[60] border-b border-zinc-100 dark:border-white/5 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
        <button onClick={() => navigateTo('home')} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <div className="text-center">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Voucher Digital</h2>
          <p className="text-[9px] font-black text-primary uppercase mt-0.5 tracking-[0.1em]">#{ticketId}</p>
        </div>
        <div className="size-12"></div>
      </header>

      <main className="flex-1 px-6 pt-6 pb-12 flex flex-col items-center max-w-sm mx-auto w-full">
        <div className="w-full flex flex-col shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 animate-in slide-in-from-bottom-12 duration-700">
          <div className="p-8 border-b-2 border-dashed border-slate-100 dark:border-zinc-800 relative">
            <div className="flex justify-between items-start mb-10">
              <IfalLogo className="h-8" />
              <div className="text-right">
                 <span className="bg-primary/10 text-primary text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Validado</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[26px] font-black text-zinc-900 dark:text-white uppercase leading-tight tracking-tighter line-clamp-2">{event.title}</h3>
              
              <div className="grid grid-cols-2 gap-y-7 pt-7 mt-5 border-t border-slate-50 dark:border-white/5">
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Inscrito</p>
                  <p className="text-[13px] font-black text-zinc-900 dark:text-white uppercase truncate pr-2">{profile.name}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Campus</p>
                  <p className="text-[13px] font-black text-zinc-900 dark:text-white uppercase truncate">{event.campus.replace('IFAL - Campus ', '')}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Data / Hora</p>
                  <p className="text-[13px] font-black text-zinc-900 dark:text-white uppercase">{event.date.split(' DE ')[0]} • {event.time.split(' ÀS ')[0]}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Localização</p>
                  <p className="text-[13px] font-black text-zinc-900 dark:text-white uppercase truncate">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 size-8 bg-slate-50 dark:bg-zinc-950 rounded-full border-r border-slate-100 dark:border-white/5 shadow-inner"></div>
            <div className="absolute -bottom-4 -right-4 size-8 bg-slate-50 dark:bg-zinc-950 rounded-full border-l border-slate-100 dark:border-white/5 shadow-inner"></div>
          </div>
          
          <div className="p-10 flex flex-col items-center text-center bg-zinc-50/20 dark:bg-zinc-900/40">
            <div className="bg-white p-5 rounded-[2.5rem] mb-8 shadow-inner ring-1 ring-slate-200 dark:ring-white/5 group active:scale-95 transition-all">
              <img src={qrUrl} alt="QR Code" className="size-44 object-contain" />
            </div>
            
            <button 
              onClick={handleDownloadQR}
              disabled={downloading}
              className="w-full h-16 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-sm"
            >
              {downloading ? <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> : <><span className="material-symbols-outlined text-primary">download</span> Salvar Offline</>}
            </button>
          </div>
        </div>

        {/* Action Buttons - Otimizados para 56dp (Padrão Android) */}
        <div className="mt-12 w-full space-y-4">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-4 mb-2">Google Agenda v3</p>
          
          <button 
            onClick={() => handleAddToCalendar(profile.email)} 
            disabled={calendarSyncing}
            className="w-full h-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[2.2rem] flex items-center justify-between px-8 text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all group overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl font-black">calendar_add_on</span>
              </div>
              <div className="text-left">
                <p className="leading-none">Sincronizar</p>
                <p className="text-[8px] text-zinc-400 font-bold uppercase mt-1 tracking-tighter">API V3 Integration</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-zinc-300">chevron_right</span>
          </button>

          <button 
            onClick={openMaps}
            className="w-full h-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[2.2rem] flex items-center justify-between px-8 text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all group"
          >
             <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl font-black">near_me</span>
              </div>
              <div className="text-left">
                <p className="leading-none">Mapa do Campus</p>
                <p className="text-[8px] text-zinc-400 font-bold uppercase mt-1 tracking-tighter">Ver Rota no Maps</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-zinc-300">chevron_right</span>
          </button>
        </div>

        <p className="mt-14 text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.6em] text-center">SIGEA • IFAL • 2025</p>
      </main>
    </div>
  );
};

export default MyTicket;
