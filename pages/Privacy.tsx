
import React from 'react';

interface PrivacyProps {
  navigateTo: (page: string) => void;
}

const Privacy: React.FC<PrivacyProps> = ({ navigateTo }) => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-50 transition-colors border-b border-zinc-200 dark:border-white/5">
        <button onClick={() => navigateTo('profile')} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-xl text-slate-900 dark:text-white active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-slate-900 dark:text-white leading-none">Privacidade</h2>
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Portal da Transparência</p>
        </div>
        <div className="size-12"></div>
      </header>

      <main className="px-6 py-10 max-w-lg mx-auto w-full space-y-10">
        <section className="space-y-4">
          <div className="size-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mb-6"><span className="material-symbols-outlined text-4xl">security</span></div>
          <h3 className="text-2xl font-[900] text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">Como cuidamos dos seus dados no IFAL</h3>
          <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">O SIGEA opera sob a Lei Geral de Proteção de Dados (LGPD) para garantir que sua jornada acadêmica seja segura e transparente.</p>
        </section>

        <div className="space-y-4">
           {[
             { title: 'Coleta Institucional', desc: 'Apenas nome, e-mail institucional e campus são vinculados para emissão de certificados válidos pelo IFAL.', icon: 'fact_check' },
             { title: 'Armazenamento Seguro', desc: 'Seus dados são criptografados em servidores dedicados e nunca são compartilhados com terceiros fora da rede federal.', icon: 'cloud_done' },
             { title: 'Seu Controle', desc: 'Você tem o direito de exportar ou excluir todos os seus dados a qualquer momento através do seu perfil.', icon: 'manage_accounts' },
             { title: 'Transparência', desc: 'Toda alteração em nossos termos é notificada via e-mail e canal oficial de comunicação do instituto.', icon: 'visibility' }
           ].map((item, idx) => (
             <div key={idx} className="p-8 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
                <div className="flex items-center gap-3 text-primary"><span className="material-symbols-outlined text-xl">{item.icon}</span><p className="text-[11px] font-black uppercase tracking-widest">{item.title}</p></div>
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 leading-relaxed uppercase tracking-tight">{item.desc}</p>
             </div>
           ))}
        </div>
        
        <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-2xl shadow-primary/30">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-80">Compromisso IFAL</p>
          <p className="text-sm font-black leading-relaxed uppercase tracking-tight">Garantimos que o SIGEA nunca comercializará informações de discentes ou servidores para fins publicitários.</p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
