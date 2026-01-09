
import React, { useState, useEffect } from 'react';
import { Event, Certificate } from '../types';
import { supabase } from '../supabaseClient';

interface CertificatesProps {
  navigateTo: (page: string) => void;
  events: Event[];
  user: any;
}

const Certificates: React.FC<CertificatesProps> = ({ navigateTo, user }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('issue_date', { ascending: false });
    
    if (!error && data) {
      setCertificates(data);
    }
    setLoading(false);
  };

  const downloadPDF = (cert: Certificate) => {
    // Simulação de download profissional
    alert(`Preparando PDF para: ${cert.event_title}\nCódigo de Validação: ${cert.validation_code}`);
  };

  return (
    <div className="flex flex-col w-full pb-24 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-6 py-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateTo('home')} 
            className="size-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white shadow-xl shadow-black/5 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] font-black">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[14px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white leading-none">Meus Certificados</h1>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">IFAL Academic Records</p>
          </div>
        </div>
        <button onClick={fetchCertificates} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 text-primary active:rotate-180 transition-all border border-slate-100 dark:border-white/5">
          <span className="material-symbols-outlined text-[20px]">refresh</span>
        </button>
      </header>

      <main className="flex-1 p-6">
        {loading ? (
           <div className="py-24 flex flex-col items-center gap-6">
              <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultando Registros...</p>
           </div>
        ) : certificates.length === 0 ? (
          <div className="py-24 text-center animate-in zoom-in duration-700 space-y-6">
            <div className="size-32 rounded-[2.5rem] bg-white dark:bg-zinc-900 flex items-center justify-center mx-auto border-2 border-dashed border-slate-200 dark:border-white/5 shadow-inner">
               <span className="material-symbols-outlined text-slate-300 dark:text-zinc-800 text-[64px]">workspace_premium</span>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-[900] text-slate-400 dark:text-zinc-400 uppercase tracking-[0.25em] leading-relaxed max-w-[200px] mx-auto">
                Ainda não há certificados registrados.
              </p>
              <p className="text-[9px] font-bold text-slate-300 dark:text-zinc-600 uppercase tracking-widest">Participe de eventos para pontuar</p>
            </div>
            <button 
              onClick={() => navigateTo('events')}
              className="px-8 py-4 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Explorar Eventos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                className="group p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl transition-all active:scale-95"
              >
                <div className="flex items-center justify-between mb-4">
                   <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[8px] font-black uppercase tracking-widest">
                     Válido via SIGEA
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">{new Date(cert.issue_date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight mb-2">{cert.event_title}</h4>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Carga Horária</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{cert.hours}h</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Autenticidade</p>
                    <p className="text-xs font-mono font-bold text-primary truncate">{cert.validation_code}</p>
                  </div>
                  <button 
                    onClick={() => downloadPDF(cert)}
                    className="size-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Certificates;
