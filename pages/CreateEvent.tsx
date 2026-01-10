
import React, { useState, useRef } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, handleSupabaseError, uploadFile } from '../supabaseClient.ts';

interface CreateEventProps {
  navigateTo: (page: string, id?: string) => void;
  onAddEvent: (event: Event) => Promise<void> | void;
  profile: any;
}

const CreateEvent: React.FC<CreateEventProps> = ({ navigateTo, onAddEvent, profile }) => {
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => 2002 + i);
  const months = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const [dateData, setDateData] = useState({ day: 1, month: "JANEIRO", year: currentYear });
  const [timeData, setTimeData] = useState({ start: "08:00", end: "18:00" });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    location: '',
    type: 'Palestra',
    certificateHours: 10
  });

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('home');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorModal({ show: true, msg: 'A imagem deve ter no máximo 5MB.' });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id) {
      setErrorModal({ show: true, msg: 'Sessão institucional inválida. Faça login novamente.' });
      return;
    }

    if (!formData.title || !formData.location) {
      setErrorModal({ show: true, msg: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    setIsPublishing(true);
    setUploadProgress(true);
    
    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000';

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `banner-${Date.now()}.${fileExt}`;
        const filePath = `events/${profile.id}/${fileName}`;
        finalImageUrl = await uploadFile('assets', filePath, selectedFile);
      }

      const formattedDate = `${dateData.day} DE ${dateData.month} DE ${dateData.year}`;
      const formattedTime = `${timeData.start} ÀS ${timeData.end}`;

      const dbEventPayload = {
        title: formData.title.toUpperCase(),
        description: formData.description,
        campus: formData.campus,
        date: formattedDate,
        time: formattedTime,
        location: formData.location.toUpperCase(),
        image_url: finalImageUrl,
        type: formData.type,
        status: 'Inscrições Abertas',
        price: 'Gratuito',
        certificate_hours: formData.certificateHours,
        organizer_id: profile.id
      };

      const { data, error } = await supabase.from('events').insert([dbEventPayload]).select();
      if (error) throw error;
      
      if (data && data[0]) {
        const newEvent: Event = { ...data[0], id: data[0].id, imageUrl: data[0].image_url, certificateHours: data[0].certificate_hours } as Event;
        localStorage.setItem(`last_published_${newEvent.id}`, JSON.stringify(newEvent));
        await onAddEvent(newEvent);
        navigateTo('publish-success', newEvent.id);
      }
    } catch (err: any) {
      setErrorModal({ show: true, msg: handleSupabaseError(err) });
    } finally {
      setIsPublishing(false);
      setUploadProgress(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in zoom-in">
          <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl border border-primary/20">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-zinc-900 dark:text-white text-xs font-black uppercase tracking-tight mb-8 leading-relaxed">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-16 bg-primary text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">OK, Corrigir</button>
          </div>
        </div>
      )}

      <header className="p-8 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} disabled={isPublishing} className="size-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 active:scale-90 transition-all disabled:opacity-50"><span className="material-symbols-outlined font-black">arrow_back</span></button>
          <div className="text-center">
            <h1 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white leading-none">Publicar Evento</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Passo {step}/3</p>
          </div>
          <div className="size-12"></div>
        </div>
        <div className="mt-6 h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_12px_#10b981]" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="p-8 space-y-12 max-w-3xl mx-auto w-full">
        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6">
            <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Dados <br /><span className="text-primary">Mestres</span></h2>
            
            <div className="space-y-8">
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Título do Evento</label>
                <input type="text" placeholder="EX: I CONGRESSO DE TECNOLOGIA IFAL" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Campus</label>
                  <select value={formData.campus} onChange={e => setFormData({...formData, campus: e.target.value})} className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none appearance-none">
                    {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Carga Horária</label>
                  <input type="number" value={formData.certificateHours} onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})} className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-6">
            <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Local e <br /><span className="text-primary">Logística</span></h2>
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Data Institucional</label>
                <div className="grid grid-cols-3 gap-3">
                  <select value={dateData.day} onChange={e => setDateData({...dateData, day: parseInt(e.target.value)})} className="h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-black text-xs text-center outline-none">
                    {days.map(d => <option key={d} value={d}>{String(d).padStart(2, '0')}</option>)}
                  </select>
                  <select value={dateData.month} onChange={e => setDateData({...dateData, month: e.target.value})} className="h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-black text-[10px] text-center outline-none">
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={dateData.year} onChange={e => setDateData({...dateData, year: parseInt(e.target.value)})} className="h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-black text-xs text-center outline-none">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Horário de Início e Término</label>
                <div className="grid grid-cols-2 gap-4">
                  <select value={timeData.start} onChange={e => setTimeData({...timeData, start: e.target.value})} className="h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-black text-xs text-center outline-none">
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select value={timeData.end} onChange={e => setTimeData({...timeData, end: e.target.value})} className="h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-black text-xs text-center outline-none">
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Localização / Sala</label>
                <input type="text" placeholder="EX: AUDITÓRIO PRINCIPAL" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-20 px-6 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Tipo de Evento</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none">
                  <option value="Palestra">Palestra</option>
                  <option value="Congresso">Congresso</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Simpósio">Simpósio</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
            <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Banner e <br /><span className="text-primary">Ementa</span></h2>
            
            <div className="space-y-8">
              <div onClick={() => !isPublishing && fileInputRef.current?.click()} className="aspect-video w-full rounded-[2.5rem] bg-slate-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-white/10 overflow-hidden shadow-inner relative group cursor-pointer transition-all hover:border-primary/50">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" /> : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-4 opacity-40">
                    <span className="material-symbols-outlined text-6xl">cloud_upload</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Enviar Banner do Evento</p>
                  </div>
                )}
                {uploadProgress && <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center"><div className="size-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Descrição / Objetivos</label>
                <textarea rows={6} placeholder="Descreva o impacto acadêmico do seu evento..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[2.5rem] font-bold text-sm dark:text-white outline-none resize-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border-t border-zinc-100 dark:border-white/5 flex gap-5 z-[100] h-32 items-center">
        <div className="max-w-3xl mx-auto w-full flex gap-5">
          <button onClick={handleBack} disabled={isPublishing} className="flex-1 h-16 bg-slate-100 dark:bg-zinc-900 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">Anterior</button>
          <button onClick={step === 3 ? handleSubmit : handleNext} disabled={isPublishing} className="flex-[2] h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all">
            {isPublishing ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{step === 3 ? 'Publicar Agora' : 'Próxima Etapa'} <span className="material-symbols-outlined text-xl">{step === 3 ? 'rocket_launch' : 'arrow_forward'}</span></>}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CreateEvent;