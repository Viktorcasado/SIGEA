
import React, { useState } from 'react';
import { UserRole } from '../types';

interface ScheduleProps {
  navigateTo: (page: string) => void;
  role?: UserRole;
}

const Schedule: React.FC<ScheduleProps> = ({ navigateTo, role = UserRole.ORGANIZER }) => {
  const [activeTab, setActiveTab] = useState<'atividades' | 'convidados' | 'locais' | 'config'>('atividades');

  const activities = [
    { num: '1314661', type: 'Palestra', title: 'Atividade Teste Horário a definir', vacancies: '0 inscritos / Vagas ilimitadas', price: 'Grátis' }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950">
      <header className="p-8 border-b border-slate-200 dark:border-white/5">
        <h1 className="text-2xl font-light text-slate-800 dark:text-white mb-8">Programação</h1>
        
        <div className="flex gap-8 border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('atividades')} className={`pb-4 text-sm transition-all relative ${activeTab === 'atividades' ? 'text-primary border-b-2 border-primary font-medium' : 'text-slate-400'}`}>Atividades</button>
          <button onClick={() => setActiveTab('convidados')} className={`pb-4 text-sm transition-all relative ${activeTab === 'convidados' ? 'text-primary border-b-2 border-primary font-medium' : 'text-slate-400'}`}>Convidados</button>
          <button onClick={() => setActiveTab('locais')} className={`pb-4 text-sm transition-all relative ${activeTab === 'locais' ? 'text-primary border-b-2 border-primary font-medium' : 'text-slate-400'}`}>Locais</button>
          <button onClick={() => setActiveTab('config')} className={`pb-4 text-sm transition-all relative ${activeTab === 'config' ? 'text-primary border-b-2 border-primary font-medium' : 'text-slate-400'}`}>Configurações</button>
        </div>
      </header>

      <main className="p-8">
        {activeTab === 'atividades' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[200px] relative">
                <input type="text" placeholder="Buscar" className="w-full h-10 pl-4 pr-10 border border-slate-200 dark:border-white/5 rounded-md text-sm outline-none" />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400">search</span>
              </div>
              <button className="h-10 px-6 border border-slate-300 dark:border-white/10 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-slate-50"><span className="material-symbols-outlined text-sm">calendar_month</span> Agenda</button>
              <button className="h-10 px-6 border border-slate-300 dark:border-white/10 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-slate-50"><span className="material-symbols-outlined text-sm">download</span> Exportar</button>
            </div>

            <button className="w-full h-12 bg-primary text-white rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-all mb-8">
              <span className="material-symbols-outlined text-sm">add</span>
              Adicionar atividade
            </button>

            <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-lg shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-white/5">
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Número</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Título</th>
                    <th className="px-6 py-4">Vagas</th>
                    <th className="px-6 py-4">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {activities.map((act, i) => (
                    <tr key={i} className="text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-6 py-5">{act.num}</td>
                      <td className="px-6 py-5">{act.type}</td>
                      <td className="px-6 py-5 text-primary font-medium">{act.title}</td>
                      <td className="px-6 py-5">{act.vacancies}</td>
                      <td className="px-6 py-5">{act.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 text-center text-[11px] text-slate-400 border-t border-slate-200">
                1 atividades sendo exibidas
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locais' && (
          <div className="space-y-6">
            <button className="w-full h-12 bg-primary text-white rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-all mb-8">
              <span className="material-symbols-outlined text-sm">add</span>
              Adicionar local
            </button>
            <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200">
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Título</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {['Sala 01', 'Sala 02', 'Auditório'].map(loc => (
                    <tr key={loc} className="text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-6 py-5 text-primary">{loc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Schedule;
