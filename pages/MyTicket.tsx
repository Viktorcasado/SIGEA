
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
      if (!response.ok) throw new Error("Falha ao baixar imagem do servidor de QR");
      
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
      console.error("Erro ao baixar QR:", error);
      alert("Não foi possível gerar o download automático devido a uma falha na rede. Por favor, mantenha pressionado o código QR acima e escolha 'Salvar Imagem'.");
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

  const openMaps = () => {
    const coords = INSTITUTION_CONTACTS[event.campus]?.coords;
    if (coords) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${coords}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.campus)}`, '_blank');
    }
  };

  const handleSaveToWallet = async () => {
    setWalletLoading(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    
    // Simulação de provisionamento de Passe Google Wallet
    // Em um ambiente real, aqui seria feita uma chamada para uma Cloud Function que gera o JWT do Passe
    setTimeout(() => {
      setWalletLoading(false);
      alert("Integração Google Wallet: Em ambiente de produção, seu passe acadêmico seria provisionado agora com tecnologia NFC/QR.");
    }, 2000);
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
            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              <button 
                onClick={handleDownloadQR}
                disabled={downloading}
                className="h-14 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all"
              >
                {downloading ? <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> : <><span className="material-symbols-outlined text-base">download</span> QR Code</>}
              </button>
              <button 
                onClick={openMaps}
                className="h-14 bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-transparent rounded-2xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">location_on</span> Ver Mapa
              </button>
            </div>
            
            {/* Google Wallet Button */}
            <button 
              onClick={handleSaveToWallet}
              disabled={walletLoading}
              className="w-full h-14 bg-zinc-950 dark:bg-zinc-950 text-white rounded-2xl flex items-center justify-center gap-3 border border-white/10 active:scale-95 transition-all shadow-xl disabled:opacity-50 overflow-hidden relative"
            >
              {walletLoading ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="h-6 w-auto" viewBox="0 0 142 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M42.345 13.905c.87 0 1.575.705 1.575 1.575v14.04c0 .87-.705 1.575-1.575 1.575h-29.61c-.87 0-1.575-.705-1.575-1.575V15.48c0-.87.705-1.575 1.575-1.575h29.61z" fill="#000"/>
                    <path d="M42.345 14.355c.615 0 1.125.51 1.125 1.125v14.04c0 .615-.51 1.125-1.125 1.125h-29.61c-.615 0-1.125-.51-1.125-1.125V15.48c0-.615.51-1.125 1.125-1.125h29.61z" fill="#000"/>
                    <path d="M12.735 21.03l.36 1.485c-.39.195-.735.435-1.02.735l-.36-1.485c.315-.285.645-.525 1.02-.735z" fill="#FBBC04"/>
                    <path d="M11.64 21.72l-.12-.045.12.045z" fill="#FBBC04"/>
                    <path d="M10.14 23.49c-.21.285-.39.615-.51.99l1.41.6c.075-.24.195-.45.33-.645l-1.23-.945z" fill="#EA4335"/>
                    <path d="M9.63 24.48l-.135-.06.135.06z" fill="#EA4335"/>
                    <path d="M10.89 26.31c.195.39.435.735.735 1.02l1.485-.36c-.285-.315-.525-.645-.735-1.02l-1.485.36z" fill="#34A853"/>
                    <path d="M11.625 27.33l.045.12-.045-.12z" fill="#34A853"/>
                    <path d="M13.395 27.81c.285.21.615.39.99.51l.6-1.41c-.24-.075-.45-.195-.645-.33l-.945 1.23z" fill="#4285F4"/>
                    <path d="M14.385 28.32l.06.135-.06-.135z" fill="#4285F4"/>
                    <path d="M19.125 22.5c0-1.86 1.515-3.375 3.375-3.375s3.375 1.515 3.375 3.375c0 1.86-1.515 3.375-3.375 3.375S19.125 24.36 19.125 22.5z" fill="#4285F4"/>
                    <path d="M22.5 14.355c-1.335 0-2.61.345-3.72.96L33.72 26.61c.615-1.11.96-2.385.96-3.72a12.188 12.188 0 00-12.18-12.18V14.355z" fill="#FBBC04"/>
                    <path d="M12.72 26.25c.615 1.11 1.485 2.07 2.52 2.79l11.415-11.415a12.215 12.215 0 00-5.31-5.31L9.93 23.73c.72 1.035 1.68 1.905 2.79 2.52z" fill="#EA4335"/>
                    <path d="M22.5 30.645c1.335 0 2.61-.345 3.72-.96L11.28 18.39c-.615 1.11-.96 2.385-.96 3.72 0 6.735 5.445 12.18 12.18 12.18V30.645z" fill="#34A853"/>
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Add to Google Wallet</span>
                </>
              )}
            </button>

            <p className="mt-6 text-[9px] font-bold text-zinc-400 uppercase leading-relaxed">Apresente no check-in para validar sua presença e carga horária.</p>
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
