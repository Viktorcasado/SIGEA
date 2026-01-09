
import React, { useState } from 'react';
import { INSTITUTION_CONTACTS } from '../constants';
import Logo from '../components/Logo.tsx';

interface HelpProps {
  navigateTo: (page: string) => void;
}

type HelpTab = 'support' | 'privacy' | 'about';

const Help: React.FC<HelpProps> = ({ navigateTo }) => {
  const [activeTab, setActiveTab] = useState<HelpTab>('support');
  const [search, setSearch] = useState('');
  
  const contacts = Object.entries(INSTITUTION_CONTACTS).filter(([name]) => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: {id: HelpTab, label: string, icon: string}[] = [
    { id: 'support', label: 'Suporte', icon: 'contact_support' },
    { id: 'privacy', label: 'Privacidade', icon: 'gavel' },
    { id: 'about', label: 'Sobre', icon: 'info' }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
      <header className="px-6 pt-12 pb-4 flex flex-col sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-50 transition-colors border-b border-zinc-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigateTo('profile')} 
            className="size-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white shadow-xl shadow-black/5 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] font-black">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-slate-900 dark:text-white leading-none">Central de Ajuda</h2>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">IFAL Transparência</p>
          </div>
          <div className="size-12"></div>
        </div>

        <div className="flex p-1.5 bg-slate-100 dark:bg-zinc-900/50 rounded-2xl gap-1 mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' 
                : 'text-slate-400 dark:text-zinc-600'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] mb-0.5 ${activeTab === tab.id ? 'filled' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 py-8">
        {activeTab === 'support' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest ml-2 mb-4">Contatos das Unidades</h3>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-80 scale-90">
                  <Logo size="sm" />
                </div>
                <input 
                  type="text" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="PESQUISAR CAMPUS OU UFAL..." 
                  className="w-full h-16 pl-18 pr-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl outline-none text-xs font-black text-slate-900 dark:text-white shadow-sm focus:ring-4 focus:ring-primary/10 transition-all uppercase tracking-widest" 
                />
              </div>
            </div>

            <div className="grid gap-4">
              {contacts.map(([campus, info]) => (
                <div key={campus} className="bg-white dark:bg-zinc-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{campus}</h4>
                      <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">{info.dept}</p>
                    </div>
                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-lg">school</span></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <a href={`mailto:${info.email}`} className="flex-1 h-12 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-widest active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-base">mail</span> E-mail
                    </a>
                    <a href={`tel:${info.phone.replace(/\D/g,'')}`} className="flex-1 h-12 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-widest active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-base">call</span> Ligar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="max-w-lg mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-4 text-center">
              <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-6 mx-auto shadow-inner"><span className="material-symbols-outlined text-4xl">shield_person</span></div>
              <h3 className="text-2xl font-[900] text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">Privacidade e LGPD</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">Compromisso do Instituto Federal com a segurança de seus dados acadêmicos.</p>
            </section>
            <div className="space-y-4">
              {[
                { title: 'Coleta Institucional', desc: 'Apenas nome, e-mail institucional e campus são vinculados para emissão de certificados válidos pelo IFAL.', icon: 'fact_check' },
                { title: 'Armazenamento Seguro', desc: 'Seus dados são criptografados em servidores dedicados e nunca compartilhados fora da rede federal.', icon: 'cloud_done' },
                { title: 'Seu Controle', desc: 'Você tem o direito de exportar ou excluir seus dados a qualquer momento pelo seu perfil.', icon: 'manage_accounts' }
              ].map((item, idx) => (
                <div key={idx} className="p-8 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
                    <div className="flex items-center gap-3 text-primary"><span className="material-symbols-outlined text-xl">{item.icon}</span><p className="text-[11px] font-black uppercase tracking-widest">{item.title}</p></div>
                    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 leading-relaxed uppercase tracking-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white dark:bg-zinc-900/50 rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-sm space-y-8 text-center">
              <div className="size-24 rounded-[2rem] bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
                <span className="text-white text-4xl font-[900] tracking-tighter">S</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">SIGEA Mobile</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">v2.5.4 Stable Build</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Plataforma</p>
                  <p className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase">Rede Federal</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Homologado</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <footer className="py-10 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.5em] dark:text-white">IFAL • SIGEA 2025</footer>
    </div>
  );
};

export default Help;
