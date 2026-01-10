import React, { useState, useEffect } from 'react';
import { UserRole, Activity } from '../types.ts';
import { supabase } from '../supabaseClient.ts';

interface ScheduleProps {
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
    const time = prompt("Horário (ex: 08:00):", "08:00") || "08:00";
    
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
           <button onClick={() => navigateTo('manage-event', eventId)} className="size-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
             <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Programação</h1>
        </div>
        
        <div className="flex gap-8 border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
          {(['atividades', 'convidados', 'locais', 'config'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="p-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'atividades' && (
              <>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex-1 min-w-[200px] relative">
                    <input 
                      type="text" 
                      placeholder="Buscar atividade..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 border border-slate-200 dark:border-white/5 rounded-2xl text-sm outline-none dark:bg-zinc-900" 
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">search</span>
                  </div>
                </div>

                {role === UserRole.ORGANIZER && (
                  <button 
                    onClick={handleAddActivity}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all mb-8 shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nova Atividade
                  </button>
                )}

                <div className="space-y-3">
                  {filteredActivities.length > 0 ? filteredActivities.map((act) => (
                    <div key={act.id} className="flex items-center gap-4 p-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-3xl shadow-sm">
                      <div className="flex flex-col items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary font-black text-xs leading-none">
                        {act.time}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{act.title}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{act.loc}</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-full text-[8px] font-black uppercase text-slate-500">{act.type}</span>
                    </div>
                  )) : (
                    <div className="py-20 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2rem]">
                      Nenhuma atividade registrada
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Schedule;