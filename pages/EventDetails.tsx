
import React, { useState, useEffect } from 'react';
import { Event, UserRole, Activity } from '../types';
import { supabase } from '../supabaseClient';

interface EventDetailsProps {
  navigateTo: (page: string, eventId?: string) => void;
  eventId: string | null;
  events: Event[];
  role?: UserRole;
}

const EventDetails: React.FC<EventDetailsProps> = ({ navigateTo, eventId, events, role = UserRole.PARTICIPANT }) => {
  const event = events.find(e => e.id === eventId) || events[0];
  const [tab, setTab] = useState<'sobre' | 'programacao'>('sobre');
  const [showToast, setShowToast] = useState(false);
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (tab === 'programacao' && eventId) {
      fetchActivities();
    }
  }, [tab, eventId]);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('event_id', eventId)
      .order('time', { ascending: true });
    
    if (!error && data) {
      setActivitiesList(data);
    }
    setLoadingActivities(false);
  };

  if (!event) return null;

  const handleDeleteActivity = async (id: string) => {
    if (confirm("Deseja realmente remover esta atividade do cronograma oficial?")) {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (!error) {
        setActivitiesList(prev => prev.filter(a => a.id !== id));
      }
    }
  };

  const handleShare = async () => {
    const shareData = { title: event.title, text: `Confira este evento no SIGEA: ${event.title}`, url: window.location.href };
    try {
      if (navigator.share) { await navigator.share(shareData); } 
      else { await navigator.clipboard.writeText(window.location.href); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }
    } catch (err) { console.log('Erro ao compartilhar:', err); }
  };

  return (
    <div className="relative flex flex-col w-full pb-32 bg-slate-50 dark:bg-zinc-950 min-h-screen animate-in fade-in duration-500 overflow-x-hidden">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl ring-1 ring-white/10">
          Link institucional copiado!
        </div>
      )}

      <div className="relative w-full h-[400px] overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-transparent to-black/40"></div>
        
        <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-30 pt-12 px-8">
          <button 
            onClick={() => navigateTo('home')} 
            className="size-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white active:scale-90 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined text-[20px] font-black">arrow_back_ios_new</span>
          </button>
          <button 
            onClick={handleShare} 
            className="size-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white active:scale-90 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined font-black">share</span>
          </button>
        </div>

        <div className="absolute bottom-20 left-6 z-20">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl ring-2 ring-white/20">
            <span className="material-symbols-outlined text-[16px]">verified</span> {event.type}
          </div>
        </div>
      </div>

      <main className="flex flex-col px-6 -mt-12 z-20 relative max-w-4xl mx-auto w-full">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl border border-white/50 dark:border-white/5 mb-6">
          <h1 className="text-3xl font-black leading-tight text-slate-900 dark:text-white tracking-tighter mb-6 uppercase">{event.title}</h1>
          <div className="flex items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-6">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shadow-inner"><span className="material-symbols-outlined text-2xl">school</span></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Unidade Responsável</p>
              <p className="text-[12px] font-black text-slate-800 dark:text-zinc-200 uppercase">{event.campus}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-10 border-b border-slate-200 dark:border-white/5 mb-10 px-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setTab('sobre')} className={`pb-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${tab === 'sobre' ? 'text-primary' : 'text-slate-400'}`}>Apresentação {tab === 'sobre' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_8px_#10b981]"></div>}</button>
          <button onClick={() => setTab('programacao')} className={`pb-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${tab === 'programacao' ? 'text-primary' : 'text-slate-400'}`}>Cronograma {tab === 'programacao' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_8px_#10b981]"></div>}</button>
        </div>

        <div className="min-h-[300px] pb-10">
          {tab === 'sobre' ? (
            <div className="animate-in fade-in slide-in-from-left-6 duration-500 space-y-8">
              <p className="text-[15px] leading-[1.8] text-slate-600 dark:text-zinc-400 font-bold">{event.description}</p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Carga Horária</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none uppercase">{event.certificateHours} Horas</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl">local_activity</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Investimento</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none uppercase">{event.price}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-6 duration-500 space-y-2 px-2">
              {loadingActivities ? (
                 <div className="py-20 flex flex-col items-center gap-4">
                    <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Sincronizando Agenda...</p>
                 </div>
              ) : activitiesList.length > 0 ? activitiesList.map((item, idx) => (
                <div key={item.id} className="flex gap-6 group relative">
                  <div className="flex flex-col items-center">
                    <div className="size-11 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 flex items-center justify-center text-primary shadow-lg z-10 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">{item.icon || 'event'}</span>
                    </div>
                    {idx !== activitiesList.length - 1 && <div className="w-[2px] flex-1 bg-slate-200 dark:bg-zinc-800 my-2 rounded-full opacity-50"></div>}
                  </div>
                  <div className="pb-10 flex-1">
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[12px] font-black text-primary tracking-widest">{item.time}</span>
                       <div className="flex items-center gap-2">
                         <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{item.type}</span>
                         {role === UserRole.ORGANIZER && (
                           <button 
                             onClick={() => handleDeleteActivity(item.id)}
                             className="size-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center active:scale-90 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                           >
                             <span className="material-symbols-outlined text-sm font-black">delete</span>
                           </button>
                         )}
                       </div>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-2 text-slate-400 dark:text-zinc-600">
                       <span className="material-symbols-outlined text-base">near_me</span>
                       <p className="text-[10px] font-bold uppercase tracking-widest">{item.loc}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-slate-100/50 dark:bg-zinc-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cronograma em processamento</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-3xl border-t border-white/20 dark:border-white/5 px-8 py-8 z-[100] shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-5 max-w-4xl mx-auto">
          <button onClick={handleShare} className="size-16 flex items-center justify-center rounded-[2rem] bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 active:scale-95 transition-all border border-slate-200 dark:border-white/5 shadow-xl"><span className="material-symbols-outlined text-2xl font-black">ios_share</span></button>
          <button onClick={() => navigateTo('register', event.id)} className="flex-1 h-16 bg-primary text-white font-black rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 border border-white/20">Solicitar Inscrição <span className="material-symbols-outlined text-2xl">verified</span></button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
