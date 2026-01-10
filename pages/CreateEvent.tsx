
import React, { useState, useRef } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, handleSupabaseError, uploadFile } from '../supabaseClient.ts';

/// Desenvolvido por Viktor Casado /// Projeto SIGEA – IFAL

interface CreateEventProps {
  navigateTo: (page: string, id?: string) => void;
  onAddEvent: (event: Event) => Promise<void> | void;
  profile: any;
}

const CreateEvent: React.FC<CreateEventProps> = ({ navigateTo, onAddEvent, profile }) => {
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    location: '',
    type: 'Palestra',
    certificateHours: 10,
    day: 1,
    month: "JANEIRO",
    year: new Date().getFullYear(),
    start: "08:00",
    end: "18:00"
  });

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('home');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorModal({ show: true, msg: 'Máximo 5MB.' });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id) return setErrorModal({ show: true, msg: 'Sessão inválida.' });
    if (!formData.title || !formData.location) return setErrorModal({ show: true, msg: 'Campos obrigatórios vazios.' });

    setIsPublishing(true);
    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000';
      if (selectedFile) {
        const filePath = `events/${profile.id}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
        finalImageUrl = await uploadFile('assets', filePath, selectedFile);
      }

      const formattedDate = `${formData.day} DE ${formData.month} DE ${formData.year}`;
      const formattedTime = `${formData.start} ÀS ${formData.end}`;

      const { data, error } = await supabase.from('events').insert([{
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
      }]).select();

      if (error) throw error;
      
      if (data && data[0]) {
        const newEvent: Event = { ...data[0], id: data[0].id, imageUrl: data[0].image_url, certificateHours: data[0].certificate_hours } as Event;
        await onAddEvent(newEvent);
        navigateTo('publish-success', newEvent.id);
      }
    } catch (err: any) {
      setErrorModal({ show: true, msg: handleSupabaseError(err) });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-[#09090b] animate-in fade-in duration-500 overflow-hidden">
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
          <div className="liquid-glass p-10 rounded-[3rem] text-center max-w-sm shadow-2xl border border-primary/20">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-white text-xs font-black uppercase tracking-tight mb-8 leading-relaxed">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-16 bg-primary text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">OK</button>
          </div>
        </div>
      )}

      <header className="p-8 pb-4 border-b border-white/5 liquid-glass sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} disabled={isPublishing} className="size-12 flex items-center justify-center rounded-2xl bg-white/5 text-zinc-400 active:scale-90 transition-all"><span className="material-symbols-outlined font-black">arrow_back</span></button>
          <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Publicar Evento</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Etapa {step}/3</p>
          </div>
          <div className="size-12"></div>
        </div>
        <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6">
            <h2 className="text-4xl font-[1000] text-white tracking-tighter uppercase leading-[0.85]">Dados <br /><span className="text-primary">Mestres</span></h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Título</label>
                <input type="text" placeholder="EX: CONFERÊNCIA DE IA" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-18 px-6 bg-white/5 border border-white/5 rounded-2xl font-black text-sm text-white outline-none focus:border-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Campus</label>
                  <select value={formData.campus} onChange={e => setFormData({...formData, campus: e.target.value})} className="w-full h-18 px-6 bg-white/5 border border-white/5 rounded-2xl font-black text-sm text-white outline-none">
                    {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Horas</label>
                  <input type="number" value={formData.certificateHours} onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})} className="w-full h-18 px-6 bg-white/5 border border-white/5 rounded-2xl font-black text-sm text-white outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-6">
            <h2 className="text-4xl font-[1000] text-white tracking-tighter uppercase leading-[0.85]">Local e <br /><span className="text-primary">Logística</span></h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Localização</label>
                <input type="text" placeholder="EX: AUDITÓRIO CENTRAL" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-18 px-6 w-full bg-white/5 border border-white/5 rounded-2xl font-black text-sm text-white outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Modalidade</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-18 px-6 bg-white/5 border border-white/5 rounded-2xl font-black text-sm text-white outline-none">
                  <option value="Palestra">Palestra</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Congresso">Congresso</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-[1000] text-white tracking-tighter uppercase leading-[0.85]">Banner e <br /><span className="text-primary">Ementa</span></h2>
            <div className="space-y-6">
              <div onClick={() => !isPublishing && fileInputRef.current?.click()} className="aspect-video w-full rounded-[2.5rem] bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-primary/50 relative">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-4xl text-zinc-700">cloud_upload</span>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Resumo</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl font-bold text-sm text-white outline-none resize-none" />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-8 border-t border-white/5 bg-[#09090b] flex gap-4 h-32 items-center">
        <button onClick={handleBack} disabled={isPublishing} className="flex-1 h-16 liquid-glass text-zinc-400 font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95">Voltar</button>
        <button onClick={step === 3 ? handleSubmit : handleNext} disabled={isPublishing} className="flex-[2] h-16 bg-primary text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95">
          {isPublishing ? 'Publicando...' : (step === 3 ? 'Publicar Agora' : 'Próximo')}
          {!isPublishing && <span className="material-symbols-outlined text-xl">{step === 3 ? 'rocket_launch' : 'arrow_forward'}</span>}
        </button>
      </footer>
    </div>
  );
};

export default CreateEvent;