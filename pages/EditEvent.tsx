
import React, { useState, useEffect, useRef } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, handleSupabaseError, uploadFile } from '../supabaseClient';

interface EditEventProps {
  navigateTo: (page: string, id?: string) => void;
  eventId: string | null;
  events: Event[];
  onUpdate: () => void;
}

const EVENT_TYPES = ['Congresso', 'Workshop', 'Palestra', 'Oficina', 'Semana Acadêmica', 'Simpósio'];

const EditEvent: React.FC<EditEventProps> = ({ navigateTo, eventId, events, onUpdate }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const event = events.find(e => e.id === eventId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    date: '',
    time: '',
    location: '',
    type: EVENT_TYPES[0],
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
      setPreviewUrl(event.imageUrl);
    }
  }, [event]);

  if (!event) return null;

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('manage-event', eventId!);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      setErrorModal({ show: true, msg: 'Preencha o título e a data institucional.' });
      return;
    }

    setIsSaving(true);
    
    try {
      let finalImageUrl = formData.imageUrl;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `update-${eventId}-${Date.now()}.${fileExt}`;
        const filePath = `events/updates/${eventId}/${fileName}`;
        finalImageUrl = await uploadFile('assets', filePath, selectedFile);
      }

      const dbUpdatePayload = {
        title: formData.title.toUpperCase(),
        description: formData.description,
        campus: formData.campus,
        date: formData.date.toUpperCase(),
        time: formData.time.toUpperCase(),
        location: formData.location.toUpperCase(),
        image_url: finalImageUrl,
        type: formData.type,
        certificate_hours: formData.certificateHours
      };

      const { error } = await supabase.from('events').update(dbUpdatePayload).eq('id', eventId);
      
      if (error) throw error;
      
      onUpdate();
      navigateTo('manage-event', eventId!);
    } catch (err: any) {
      setIsSaving(false);
      setErrorModal({ show: true, msg: handleSupabaseError(err) });
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500 overflow-x-hidden">
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in zoom-in">
          <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-white text-xs font-black uppercase tracking-tight mb-8 leading-relaxed">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-16 bg-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">Entendido</button>
          </div>
        </div>
      )}

      <header className="p-6 lg:p-8 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={handleBack} className="size-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 active:scale-90 transition-all border border-transparent dark:border-white/5"><span className="material-symbols-outlined font-black">arrow_back</span></button>
          <div className="text-center">
            <h1 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Editar Registro</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Passo {step}/3</p>
          </div>
          <div className="size-12"></div>
        </div>
        <div className="max-w-3xl mx-auto mt-6 h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_12px_#10b981]" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="p-6 lg:p-12 space-y-10 max-w-3xl mx-auto w-full flex-1">
        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6">
            <div className="space-y-3">
              <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Dados <br /><span className="text-primary">Gerais</span></h2>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2.5 px-1">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Título do Evento</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5 px-1">
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Modalidade</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none appearance-none">{EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
                <div className="space-y-2.5 px-1">
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Horas</label>
                  <input type="number" value={formData.certificateHours} onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})} className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-6">
             <div className="space-y-3">
              <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Local e <br /><span className="text-primary">Data</span></h2>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-400 uppercase">Data</label>
                  <input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-20 px-6 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-400 uppercase">Período</label>
                  <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-20 px-6 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                </div>
              </div>
              <div className="space-y-2.5 px-1">
                <label className="text-[11px] font-black text-zinc-400 uppercase">Localização / Sala</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="space-y-3">
              <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Banner e <br /><span className="text-primary">Texto</span></h2>
            </div>

            <div className="space-y-8">
              <div onClick={() => fileInputRef.current?.click()} className="aspect-video w-full rounded-[3rem] bg-slate-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-white/5 overflow-hidden shadow-inner relative group cursor-pointer transition-all hover:border-primary/50">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <img src={previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Banner Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm"><span className="material-symbols-outlined text-white text-4xl">edit</span></div>
              </div>
              
              <div className="space-y-2.5 px-1">
                <label className="text-[11px] font-black text-zinc-400 uppercase">Descrição Atualizada</label>
                <textarea rows={6} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] font-bold text-sm dark:text-white outline-none resize-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 lg:p-8 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border-t border-zinc-100 dark:border-white/5 flex gap-5 z-[100] h-32 items-center">
        <div className="max-w-3xl mx-auto w-full flex gap-5">
          <button onClick={handleBack} className="flex-1 h-16 bg-slate-100 dark:bg-zinc-900 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">Anterior</button>
          <button onClick={step === 3 ? handleSubmit : handleNext} disabled={isSaving} className="flex-[2] h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all">
            {isSaving ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{step === 3 ? 'Atualizar Evento' : 'Próxima Etapa'} <span className="material-symbols-outlined text-xl">{step === 3 ? 'save' : 'arrow_forward'}</span></>}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default EditEvent;
