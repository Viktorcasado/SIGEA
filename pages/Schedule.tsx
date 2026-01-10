
import React, { useState, useEffect } from 'react';
import { UserRole, Activity } from '../types';
import { supabase } from '../supabaseClient';

interface ScheduleProps {
  // Fix: navigateTo should accept an optional id argument
  navigateTo: (page: string, id?: string | null) => void;
  eventId: string | null;
  role?: UserRole;
}

const Schedule: React.FC<ScheduleProps> = ({ navigateTo, eventId, role = UserRole.ORGANIZER }) => {
  const [activeTab, setActiveTab] = useState<'atividades' | 'convidados' | 'locais' | 'config'>('atividades');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (eventId) {
      fetchData();
    }
  }, [eventId, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'atividades') {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('event_id', eventId)
          .order('time', { ascending: true });
        if (!error && data) setActivities(data);
      } else if (activeTab === 'locais') {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('event_id', eventId);
        if (!error && data) setLocations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    const title = prompt("Título da Atividade:");
    if (!title) return;
    const time = prompt("Horário (ex: 08:00):", "08:00");
    
    const { error } = await supabase.from('activities').insert([{
      event_id: eventId,
      title: title.toUpperCase(),
      time: time,
      type: 'Palestra',
      loc: 'Auditório Principal'
    }]);
    
    if (!error) fetchData();
  };

  const handleAddLocation = async () => {
    const title = prompt("Nome do Local:");
    if (!title) return;
    const { error } = await supabase.from('locations').insert([{
      event_id: eventId,
      title: title
    }]);
    if (!error) fetchData();
  };

  const filteredActivities = activities.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 animate-in fade-in duration-500">
      <header className="p-8 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigateTo('manage-event', eventId!)} className="lg:hidden size-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600"><span className="material-symbols-outlined">arrow_back</span></button>
           <h1 className="text-2xl font-light text-slate-800 dark:text-white">Programação</h1>
        </div>
        
        <div className="flex gap-8 border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
          {(['atividades', 'convidados', 'locais', 'config'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`pb-4 text-sm transition-all relative capitalize ${activeTab === tab ? 'text-primary border-b-2 border-primary font-medium' : 'text-slate-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="p-8">
        {loading ? (
          <div className="py-20 flex justify-center"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <>
            {activeTab === 'atividades' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex-1 min-w-[200px] relative">
                    <input 
                      type="text" 
                      placeholder="Buscar" 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full h-10 pl-4 pr-10 border border-slate-200 dark:border-white/5 rounded-md text-sm outline-none dark:bg-zinc-900" 
                    />
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400">search</span>
                  </div>
                  <button className="h-10 px-6 border border-slate-300 dark:border-white/10 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-slate-50"><span className="material-symbols-outlined text-sm">download</span> Exportar</button>
                </div>

                <button 
                  onClick={handleAddActivity}
                  className="w-full h-12 bg-primary text-white rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-all mb-8 shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Adicionar atividade
                </button>

                <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-lg shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-white/5">
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Horário</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Título</th>
                        <th className="px-6 py-4">Local</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {filteredActivities.length > 0 ? filteredActivities.map((act, i) => (
                        <tr key={act.id} className="text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-5 font-black">{act.time}</td>
                          <td className="px-6 py-5"><span className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded text-[10px] uppercase font-bold">{act.type}</span></td>
                          <td className="px-6 py-5 text-primary font-bold">{act.title}</td>
                          <td className="px-6 py-5 text-zinc-500">{act.loc}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-xs uppercase font-bold tracking-widest">Nenhuma atividade registrada</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'locais' && (
              <div className="space-y-6">
                <button 
                  onClick={handleAddLocation}
                  className="w-full h-12 bg-primary text-white rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-all mb-8 shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Adicionar local
                </button>
                <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-lg">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-white/5">
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Nome do Local</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {locations.length > 0 ? locations.map(loc => (
                        <tr key={loc.id} className="text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/5">
                          <td className="px-6 py-5 text-primary font-medium">{loc.title}</td>
                        </tr>
                      )) : (
                        <tr><td className="px-6 py-10 text-center text-slate-400 text-xs uppercase font-bold tracking-widest">Nenhum local cadastrado</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Schedule;
