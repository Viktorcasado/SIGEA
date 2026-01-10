
import React, { useState } from 'react';

interface PortalBrowserProps {
  url: string;
  name: string;
  onClose: () => void;
}

const PortalBrowser: React.FC<PortalBrowserProps> = ({ url, name, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-[20000] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl h-[92vh] bg-white dark:bg-[#09090b] rounded-t-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        {/* Browser Header */}
        <header className="h-20 bg-primary flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">shield_person</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-white tracking-widest">{name} Integrado</span>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 bg-emerald-300 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Conexão Segura IFAL</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => window.open(url, '_blank')}
              className="size-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white active:scale-90"
              title="Abrir em Nova Aba"
             >
               <span className="material-symbols-outlined text-[18px]">open_in_new</span>
             </button>
             <button 
              onClick={onClose}
              className="h-10 px-6 rounded-xl bg-white text-primary font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2"
             >
               Sair do Portal
               <span className="material-symbols-outlined text-sm font-black">close</span>
             </button>
          </div>
        </header>

        {/* Browser Content */}
        <div className="flex-1 relative bg-slate-100">
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center gap-6">
               <div className="size-16 border-[5px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <div className="text-center space-y-2">
                 <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Sincronizando Identidade</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aguarde a autenticação do {name}</p>
               </div>
            </div>
          )}
          
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            title={name}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
        
        {/* Footer info bar */}
        <footer className="h-8 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-white/5 flex items-center justify-center px-6">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Os dados de login não são armazenados pelo SIGEA. Navegação via Túnel Oficial.</p>
        </footer>
      </div>
    </div>
  );
};

export default PortalBrowser;
