
import React from 'react';
import IfalLogo from '../components/IfalLogo.tsx';

interface WelcomeProps {
  onContinue: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-white dark:bg-[#09090b] overflow-hidden font-sans transition-colors duration-500">
      {/* Camada de Background: Gradientes Dinâmicos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] size-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] size-[400px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px]"></div>
        
        {/* Imagem de Fundo com Overlay Suave */}
        <img 
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.07] grayscale" 
          alt="Overlay" 
        />
      </div>

      {/* Header: Logo IFAL com Identidade Oficial */}
      <header className="relative pt-16 px-8 flex justify-center animate-in fade-in slide-in-from-top-6 duration-1000">
        <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-slate-200 dark:border-white/10 flex items-center gap-4 shadow-xl shadow-black/5 transition-all">
          <IfalLogo className="h-8" />
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Portal de Eventos</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Campus & Comunidade</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col justify-end px-10 pb-16 max-w-xl mx-auto w-full">
        
        {/* Branding Central */}
        <div className="mb-12 space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
          <div className="space-y-2">
            <h1 className="text-slate-900 dark:text-white text-[92px] font-[950] leading-[0.75] tracking-[-0.08em]">
              SI<span className="text-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">GEA</span>
            </h1>
            <div className="h-2 w-24 bg-primary rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.4)]"></div>
          </div>
          
          <p className="text-slate-600 dark:text-zinc-400 text-xl font-medium leading-tight pr-10">
            Conectando o <span className="text-slate-900 dark:text-white font-black">IFAL</span> à comunidade através de eventos, ciência e cultura.
          </p>
        </div>

        {/* Features Quick-Look */}
        <div className="grid grid-cols-3 gap-4 mb-14 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          {[
            { icon: 'groups', label: 'Comunidade' },
            { icon: 'military_tech', label: 'Certificados' },
            { icon: 'qr_code_2', label: 'Acesso' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-5 rounded-[2rem] bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-zinc-800 hover:shadow-lg">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-center">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Action Button (Elite UI) */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
          <button 
            onClick={onContinue}
            className="group relative w-full h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] flex items-center justify-between px-10 shadow-2xl shadow-black/20 dark:shadow-white/5 active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="text-xs font-[900] uppercase tracking-[0.3em] relative z-10 group-hover:text-white transition-colors">Entrar no Portal</span>
            <div className="size-12 rounded-full bg-white/10 dark:bg-slate-900/5 flex items-center justify-center relative z-10 group-hover:bg-white transition-colors">
              <span className="material-symbols-outlined text-white dark:text-slate-900 group-hover:text-primary transition-colors">arrow_forward</span>
            </div>
          </button>

          <footer className="flex flex-col items-center gap-2 opacity-30">
            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.5em]">Conhecimento • Integração • Cidadania</p>
            <div className="flex items-center gap-4 text-[8px] font-bold text-slate-400 uppercase">
              <span>Sigea Mobile v2.5</span>
              <div className="size-1 bg-slate-300 rounded-full"></div>
              <span>IFAL 2025</span>
            </div>
          </footer>
        </div>
      </main>
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-primary/3 rounded-full blur-[160px] pointer-events-none"></div>
    </div>
  );
};

export default Welcome;
