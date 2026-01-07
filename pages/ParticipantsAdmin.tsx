
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
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm p-4 border-b border-gray-200 text-center">
        <button onClick={() => navigateTo('home')} className="absolute left-4 top-4 material-symbols-outlined">arrow_back</button>
        <h2 className="text-lg font-black uppercase">Participantes</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lista de Inscritos</p>
      </header>

      <main className="p-4 space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-3">
            {participants.length === 0 ? (
              <div className="py-20 text-center text-slate-400 uppercase text-xs font-black">Nenhum inscrito ainda.</div>
            ) : (
              participants.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 shadow-sm">
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black truncate">{p.name}</h4>
                    <p className="text-[10px] text-gray-500 truncate">{p.email}</p>
                    <p className="text-[8px] font-bold text-primary uppercase mt-0.5">{p.role} • {p.campus}</p>
                  </div>
                  <span className="text-[8px] font-black px-2 py-1 rounded uppercase bg-green-100 text-green-700">{p.status}</span>
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
