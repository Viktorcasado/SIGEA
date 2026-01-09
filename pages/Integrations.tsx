
import React, { useState } from 'react';

interface IntegrationSystem {
  id: string;
  name: string;
  fullName: string;
  description: string;
  color: string;
  url: string;
  icon: string;
}

const SYSTEMS: IntegrationSystem[] = [
  { id: 'suap', name: 'SUAP', fullName: 'Sistema Unificado de Administração Pública', description: 'Dados funcionais, acadêmicos e processos eletrônicos.', color: '#2ecc71', url: 'https://suap.ifal.edu.br', icon: 'account_balance' },
  { id: 'sigaa', name: 'SIGAA', fullName: 'Sistema de Gestão de Atividades Acadêmicas', description: 'Matrículas, turmas virtuais e histórico escolar.', color: '#3498db', url: 'https://sigaa.ifal.edu.br', icon: 'school' },
  { id: 'sipac', name: 'SIPAC', fullName: 'Sistema de Patrimônio, Administração e Contratos', description: 'Gestão de bens e requisições institucionais.', color: '#f1c40f', url: 'https://sipac.ifal.edu.br', icon: 'inventory_2' },
  { id: 'sigrh', name: 'SIGRH', fullName: 'Sistema de Gestão de Recursos Humanos', description: 'Folha de pagamento, férias e vida funcional.', color: '#e74c3c', url: 'https://sigrh.ifal.edu.br', icon: 'badge' },
  { id: 'sigadmin', name: 'SIGAdmin', fullName: 'Sistema de Administração e Comunicação', description: 'Gestão de permissões e configurações de rede.', color: '#9b59b6', url: 'https://sigadmin.ifal.edu.br', icon: 'settings_suggest' },
];

interface IntegrationsProps {
  navigateTo: (page: string) => void;
}

const Integrations: React.FC<IntegrationsProps> = ({ navigateTo }) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const handleSync = (id: string) => {
    setSyncingId(id);
    setProgress(0);
    
    // Simulação de sincronização robusta
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncingId(null);
          if (!connectedIds.includes(id)) {
            setConnectedIds(prevIds => [...prevIds, id]);
          }
          if (window.navigator.vibrate) window.navigator.vibrate([20, 50, 20]);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-50 border-b border-zinc-200 dark:border-white/5">
        <button 
          onClick={() => navigateTo('home')} 
          className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-slate-900 dark:text-white">Sincronização</h2>
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Ecossistema IFAL</p>
        </div>
        <div className="size-12"></div>
      </header>

      <main className="px-6 pt-6 space-y-8 max-w-2xl mx-auto w-full">
        <section className="text-center space-y-3">
          <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">Portais Integrados</h3>
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 leading-relaxed uppercase tracking-tight">
            Conecte suas contas para importar automaticamente certificados, horas complementares e dados acadêmicos para o SIGEA.
          </p>
        </section>

        <div className="grid gap-4">
          {SYSTEMS.map((sys) => {
            const isSyncing = syncingId === sys.id;
            const isConnected = connectedIds.includes(sys.id);

            return (
              <div key={sys.id} className="bg-white dark:bg-zinc-900/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl transition-all hover:border-primary/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: sys.color }}>
                      <span className="material-symbols-outlined text-3xl">{sys.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{sys.name}</h4>
                      <p className="text-[8px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{sys.fullName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isConnected ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                      {isConnected ? 'Conectado' : 'Pendente'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 leading-relaxed uppercase mb-6 px-1">
                  {sys.description}
                </p>

                {isSyncing ? (
                  <div className="space-y-3 px-1 animate-in fade-in">
                    <div className="flex justify-between items-end">
                      <p className="text-[9px] font-black text-primary uppercase animate-pulse">Sincronizando Metadados...</p>
                      <p className="text-[10px] font-black text-primary">{progress}%</p>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleSync(sys.id)}
                      className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${isConnected ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                    >
                      <span className="material-symbols-outlined text-lg">{isConnected ? 'sync' : 'link'}</span>
                      {isConnected ? 'Atualizar Dados' : 'Vincular Conta'}
                    </button>
                    <a 
                      href={sys.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="size-14 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90 shadow-sm"
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="mt-auto py-10 text-center">
        <p className="text-[9px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-[0.5em]">Segurança Ponta-a-Ponta • IFAL</p>
      </footer>
    </div>
  );
};

export default Integrations;
