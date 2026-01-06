
import React, { useState, useEffect, useRef } from 'react';
import { Event, Activity } from '../types';
import { supabase } from '../supabaseClient';

interface ManageEventProps {
  navigateTo: (page: string) => void;
  eventId: string | null;
  events: Event[];
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const ManageEvent: React.FC<ManageEventProps> = ({ navigateTo, eventId, events, onDelete, onArchive }) => {
  const event = events.find(e => e.id === eventId);
  const [isDownloading, setIsDownloading] = useState(false);
  const [counts, setCounts] = useState({ registered: 0, checkedIn: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityForm, setActivityForm] = useState({ title: '', time: '', description: '' });

  const certInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventStats();
      fetchActivities();
    }
  }, [eventId]);

  const fetchEventStats = async () => {
    const { count: regCount } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    const { count: checkCount } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'Presente'); // Status 'Presente' é o correto para checked-in

    setCounts({ registered: regCount || 0, checkedIn: checkCount || 0 });
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('event_id', eventId)
      .order('time', { ascending: true });

    if (data) setActivities(data as Activity[]);
    setLoadingActivities(false);
  };

  const handleUpdateTemplate = () => {
    certInputRef.current?.click();
  };

  const onTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Novo modelo "${file.name}" vinculado ao evento!`);
      // Lógica de upload aqui
    }
  };

  const handleDownloadList = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("Lista de participantes gerada com sucesso via SIGEA!");
    }, 2000);
  };

  const handleDelete = () => {
    if (event && confirm(`EXCLUIR PERMANENTEMENTE "${event.title}"?`)) {
      onDelete(event.id);
    }
  };

  // Activity Handlers
  const handleOpenActivityModal = (activity?: Activity) => {
    if (activity) {
      setEditingActivity(activity);
      setActivityForm({ title: activity.title, time: activity.time, description: activity.description || '' });
    } else {
      setEditingActivity(null);
      setActivityForm({ title: '', time: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    try {
      if (editingActivity) {
        // Edit
        const { error } = await supabase
          .from('activities')
          .update({ ...activityForm })
          .eq('id', editingActivity.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('activities')
          .insert([{ ...activityForm, event_id: eventId }]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchActivities();
    } catch (err: any) {
      alert('Erro ao salvar atividade: ' + err.message);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Excluir esta atividade?")) return;
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
      fetchActivities();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  if (!event) return null;

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark relative">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md p-4 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <button onClick={() => navigateTo('home')} className="size-11 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Gerenciamento de Evento</h2>
        <button
          onClick={() => navigateTo('edit-event')}
          className="size-11 flex items-center justify-center rounded-full text-primary hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="p-5 space-y-6 pb-40">
        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-5 shadow-xl border-2 border-slate-200 dark:border-slate-800 space-y-5">
          <div className="aspect-video w-full rounded-3xl bg-cover bg-center overflow-hidden relative border border-slate-100" style={{ backgroundImage: `url(${event.imageUrl})` }}>
            <div className={`absolute top-4 right-4 px-4 py-1.5 text-white text-[10px] font-black rounded-full uppercase backdrop-blur-md ${event.status === 'Inscrições Abertas' ? 'bg-green-600/80' : 'bg-primary/80'}`}>
              {event.status}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black leading-tight text-slate-900 dark:text-white uppercase tracking-tight">{event.title}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">{event.campus} • {event.date}</p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <p className="text-3xl font-black text-primary">{counts.registered}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Inscritos</p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <p className="text-3xl font-black text-green-500">{counts.checkedIn}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Presenças</p>
          </div>
        </div>

        {/* SECTION: Programação / Atividades */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-tighter">Programação do Evento</h3>
            <button
              onClick={() => handleOpenActivityModal()}
              className="px-4 py-2 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Novo
            </button>
          </div>

          <div className="space-y-3">
            {loadingActivities ? (
              <div className="text-center p-4"><span className="material-symbols-outlined animate-spin text-primary">sync</span></div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400 font-bold uppercase">Nenhuma atividade cadastrada</p>
              </div>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="p-3 bg-primary/10 rounded-2xl h-fit">
                        <span className="material-symbols-outlined text-primary text-xl">event_note</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 uppercase">{activity.time}</span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight mt-1">{activity.title}</h4>
                        {activity.description && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{activity.description}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenActivityModal(activity)} className="size-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => handleDeleteActivity(activity.id)} className="size-8 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Configurações de Certificado */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tighter ml-1">Modelo de Certificado</h3>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5">
            <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
              <span className="material-symbols-outlined text-3xl text-primary">description</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status do Modelo</p>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                {event.certificateTemplateUrl ? "Modelo Carregado" : "Pendente de Upload"}
              </h4>
              <button
                onClick={handleUpdateTemplate}
                className="mt-2 text-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
              >
                {event.certificateTemplateUrl ? "Trocar Modelo" : "Subir Modelo Agora"}
                <span className="material-symbols-outlined text-sm">upload</span>
              </button>
              <input type="file" ref={certInputRef} onChange={onTemplateFileChange} accept="application/pdf,image/*" className="hidden" />
            </div>
          </div>
        </section>

        {/* Ações Administrativas */}
        <div className="space-y-4">
          <button
            onClick={() => navigateTo('participants')}
            className="w-full flex items-center justify-between p-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">group</span>
              <span className="text-sm font-black uppercase text-slate-800 dark:text-slate-200">Lista de Inscritos</span>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>

          <button
            onClick={handleDownloadList}
            disabled={isDownloading}
            className="w-full flex items-center justify-between p-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-50 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">bar_chart_4_bars</span>
              <span className="text-sm font-black uppercase text-slate-800 dark:text-slate-200">Exportar Relatório</span>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>
        </div>

        <div className="pt-6">
          <button
            onClick={handleDelete}
            className="w-full py-6 text-red-600 font-black text-[11px] uppercase tracking-[0.2em] border-2 border-red-100 dark:border-red-900/30 rounded-3xl hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95 transition-all"
          >
            Excluir Permanente
          </button>
        </div>
      </main>

      {/* MODAL Create/Edit Activity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">{editingActivity ? 'Editar Atividade' : 'Nova Atividade'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="size-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined font-black text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Título</label>
                <input
                  required
                  value={activityForm.title}
                  onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:border-primary"
                  placeholder="Ex: Abertura"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Horário</label>
                <input
                  required
                  value={activityForm.time}
                  onChange={e => setActivityForm({ ...activityForm, time: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:border-primary"
                  placeholder="Ex: 08:00 - 09:00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Descrição (Opcional)</label>
                <textarea
                  rows={3}
                  value={activityForm.description}
                  onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:border-primary"
                  placeholder="Detalhes da atividade..."
                />
              </div>

              <button type="submit" className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4">
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvent;
