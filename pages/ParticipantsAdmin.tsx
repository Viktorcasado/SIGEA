
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface ParticipantsAdminProps {
  navigateTo: (page: string) => void;
  eventId: string | null;
}

const ParticipantsAdmin: React.FC<ParticipantsAdminProps> = ({ navigateTo, eventId }) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      let query = supabase.from('registrations').select('*');
      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setParticipants(data);
      }
      setLoading(false);
    };

    fetchParticipants();
  }, [eventId]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-800 text-center">
        <button onClick={() => navigateTo('home')} className="absolute left-4 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-black uppercase">Participantes</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestão de Inscritos</p>
      </header>

      <main className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-2xl font-black text-primary">{participants.length}</p>
            <p className="text-[8px] font-bold text-gray-400 uppercase">Inscritos</p>
          </div>
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-2xl font-black text-green-500">
              {participants.filter(p => p.status === 'Confirmado').length}
            </p>
            <p className="text-[8px] font-bold text-gray-400 uppercase">Presentes</p>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-400 font-bold uppercase text-xs">Carregando...</div>
          ) : participants.length > 0 ? (
            participants.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border shadow-sm">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                  {p.user_name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black truncate">{p.user_name}</h4>
                  <p className="text-[10px] text-gray-500 truncate">{p.user_email}</p>
                  <p className="text-[8px] font-bold text-primary uppercase mt-0.5">{p.user_campus}</p>
                </div>
                <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${p.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 font-bold uppercase text-xs">Nenhum inscrito.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParticipantsAdmin;
