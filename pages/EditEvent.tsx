
import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, handleSupabaseError } from '../supabaseClient';

interface EditEventProps {
  navigateTo: (page: string, id?: string) => void;
  eventId: string | null;
  events: Event[];
  onUpdate: () => void;
}

const EditEvent: React.FC<EditEventProps> = ({ navigateTo, eventId, events, onUpdate }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });

  const event = events.find(e => e.id === eventId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    date: '',
    time: '',
    location: '',
    type: 'Congresso',
    imageUrl: '', 
    certificateHours: 10
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        campus: event.campus,
        date: event.date,
        time: event.time,
        location: event.location,
        type: event.type,
        imageUrl: event.imageUrl,
        certificateHours: event.certificateHours
      });
    }
  }, [event]);

  if (!event) return null;

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('manage-event', eventId!);

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      setErrorModal({ show: true, msg: 'Por favor, preencha o título e a data.' });
      return;
    }

    setIsSaving(true);
    
    const dbUpdatePayload = {
      title: formData.title.toUpperCase(),
      description: formData.description,
      campus: formData.campus,
      date: formData.date.toUpperCase(),
      time: formData.time,
      location: formData.location,
      image_url: formData.imageUrl,
      type: formData.type,
      certificate_hours: formData.certificateHours
    };

    try {
      const { error } = await supabase
        .from('events')
        .update(dbUpdatePayload)
        .eq('id', eventId);
      
      if (error) throw error;
      
      onUpdate();
      navigateTo('manage-event', eventId!);
    } catch (err: any) {
      setErrorModal({ show: true, msg: handleSupabaseError(err) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500 overflow-x-hidden">
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in zoom-in">
          <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-white text-xs font-black uppercase tracking-tight mb-8 leading-relaxed">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-16 bg-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">OK, ENTENDI</button>
          </div>
        </div>
      )}

      <header className="p-6 lg:p-8 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack} 
            className="size-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 active:scale-90 transition-all border border-transparent dark:border-white/5"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Editar Evento</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Sincronizando Etapa {step}/3</p>
          </div>
          <div className="size-12"></div>
        </div>
        <div className="max-w-3xl mx-auto mt-6 h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_12px_#10b981]" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="p-6 lg:p-12 space-y-10 max-w-3xl mx-auto w-full flex-1">
        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6">
            <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Alterar <br /> <span className="text-primary">Gerais</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Ajuste as informações fundamentais do evento.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3 col-span-full">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Título do Evento</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:border-primary transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Campus / Unidade</label>
                <div className="relative">
                  <select 
                    value={formData.campus}
                    onChange={e => setFormData({...formData, campus: e.target.value})}
                    className="w-full h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none appearance-none"
                  >
                    {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Horas Certificadas</label>
                <input 
                  type="number" 
                  value={formData.certificateHours}
                  onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})}
                  className="w-full h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-6">
             <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Local e <br /> <span className="text-primary">Data</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Data</label>
                <input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-18 px-6 w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Horário</label>
                <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-18 px-6 w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
              <div className="space-y-3 col-span-full">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Localização</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Mídia e <br /> <span className="text-primary">Texto</span></h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">URL do Banner</label>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-bold text-sm dark:text-white outline-none"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Descrição</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-8 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[3rem] font-bold text-sm dark:text-white outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 lg:p-8 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl border-t border-zinc-100 dark:border-white/5 flex gap-5 z-[100] h-32 lg:h-28 items-center">
        <div className="max-w-3xl mx-auto w-full flex gap-5">
          <button 
            onClick={handleBack} 
            className="flex-1 h-16 lg:h-14 bg-slate-100 dark:bg-zinc-900 text-slate-500 font-black rounded-3xl uppercase text-[10px] tracking-widest active:scale-95 transition-all"
          >
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>
          <button 
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={isSaving}
            className="flex-[2] h-16 lg:h-14 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {step === 3 ? 'Salvar Alterações' : 'Próxima Etapa'}
                <span className="material-symbols-outlined text-xl">{step === 3 ? 'save' : 'arrow_forward'}</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default EditEvent;
