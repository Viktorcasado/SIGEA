
import React, { useEffect, useState } from 'react';
import { Participant } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface ParticipantsAdminProps {
  navigateTo: (page: string) => void;
  eventId?: string;
}

const ParticipantsAdmin: React.FC<ParticipantsAdminProps> = ({ navigateTo, eventId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (isSupabaseConfigured() && eventId) {
        setLoading(true);
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', eventId);
        
        if (data && !error) {
          const mapped: Participant[] = data.map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role,
            campus: p.campus,
            status: p.status
          }));
          setParticipants(mapped);
        }
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [eventId]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
        <button 
          onClick={() => navigateTo('home')} 
          className="size-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white shadow-xl shadow-black/5 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px] font-black">arrow_back_ios_new</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Participantes</h2>
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Lista de Inscritos</p>
        </div>
        <div className="size-12"></div>
      </header>

      <main className="p-6 space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-3">
            {participants.length === 0 ? (
              <div className="py-20 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-white/5">
                Nenhum inscrito institucional.
              </div>
            ) : (
              participants.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-sm animate-in slide-in-from-left-4 transition-all hover:scale-[1.02]">
                  <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black truncate uppercase text-zinc-900 dark:text-white">{p.name}</h4>
                    <p className="text-[9px] text-zinc-500 truncate font-bold">{p.email}</p>
                    <p className="text-[8px] font-black text-primary uppercase mt-1 tracking-widest">{p.role} • {p.campus}</p>
                  </div>
                  <span className="text-[8px] font-black px-3 py-1.5 rounded-full uppercase bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">{p.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ParticipantsAdmin;
