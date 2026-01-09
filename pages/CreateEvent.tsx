
import React, { useState, useRef } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, handleSupabaseError, uploadFile } from '../supabaseClient';

interface CreateEventProps {
  navigateTo: (page: string, id?: string) => void;
  onAddEvent: (event: Event) => Promise<void> | void;
  profile: any;
}

const EVENT_TYPES = ['Congresso', 'Workshop', 'Palestra', 'Oficina', 'Semana Acadêmica', 'Simpósio'];
const ROOM_SUGGESTIONS = ['Auditório Central', 'Miniauditório', 'Sala de Conferências', 'Laboratório de Informática', 'Bloco A - Sala 01', 'Espaço Ágora'];

const CreateEvent: React.FC<CreateEventProps> = ({ navigateTo, onAddEvent, profile }) => {
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    date: '',
    time: '08:00 ÀS 18:00',
    location: '',
    type: EVENT_TYPES[0],
    certificateHours: 10
  });

  const handleNext = () => {
    if (step === 1 && (!formData.title || formData.certificateHours <= 0)) {
       setErrorModal({ show: true, msg: 'Título e Carga Horária são obrigatórios.' });
       return;
    }
    if (step === 2 && (!formData.date || !formData.location)) {
       setErrorModal({ show: true, msg: 'Defina a data e o local físico do evento.' });
       return;
    }
    step < 3 && setStep(s => s + 1);
  };
  
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('home');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorModal({ show: true, msg: 'Selecione apenas arquivos de imagem.' });
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
      setErrorModal({ show: true, msg: 'Sessão inválida. Faça login novamente.' });
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

      setUploadProgress(false);

      const dbEventPayload = {
        title: formData.title.toUpperCase(),
        description: formData.description,
        campus: formData.campus,
        date: formData.date.toUpperCase(),
        time: formData.time.toUpperCase(),
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
        const newEvent: Event = {
          ...data[0],
          id: data[0].id,
          imageUrl: data[0].image_url,
          certificateHours: data[0].certificate_hours
        } as Event;

        await onAddEvent(newEvent);
        navigateTo('publish-success', newEvent.id);
      }
    } catch (err: any) {
      setIsPublishing(false);
      setUploadProgress(false);
      setErrorModal({ show: true, msg: handleSupabaseError(err) });
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500 overflow-x-hidden">
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in zoom-in">
          <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-white text-xs font-black uppercase tracking-tight mb-8">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-16 bg-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">OK, Corrigir</button>
          </div>
        </div>
      )}

      <header className="p-6 lg:p-8 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={handleBack} disabled={isPublishing} className="size-14 lg:size-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 active:scale-90 transition-all disabled:opacity-50"><span className="material-symbols-outlined font-black">arrow_back</span></button>
          <div className="text-center">
            <h1 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Criar Evento</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Etapa {step}/3</p>
          </div>
          <div className="size-14 lg:size-12"></div>
        </div>
        <div className="max-w-3xl mx-auto mt-6 h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_12px_#10b981]" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="p-6 lg:p-12 space-y-12 max-w-3xl mx-auto w-full flex-1">
        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6">
            <div className="space-y-3">
              <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Dados <br /><span className="text-primary">Gerais</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Atenção: Estas informações serão usadas na emissão de certificados.</p>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest ml-1">Título Institucional</label>
                <input 
                  type="text" 
                  placeholder="EX: I SEMANA DE INFORMÁTICA DO IFAL" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest ml-1">Modalidade / Tipo</label>
                  <div className="relative">
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none appearance-none"
                    >
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-primary">expand_more</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest ml-1">Carga Horária (Horas)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formData.certificateHours}
                      onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})}
                      className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary uppercase">Horas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-6">
             <div className="space-y-3">
              <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Local e <br /><span className="text-primary">Data</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Informe onde e quando as atividades presenciais ocorrerão.</p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Data do Evento</label>
                  <input type="text" placeholder="EX: 25 DE OUTUBRO" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-20 px-6 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Horário de Início e Fim</label>
                  <input type="text" placeholder="EX: 08:00 ÀS 18:00" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-20 px-6 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Local Físico / Sala</label>
                  <input 
                    type="text" 
                    placeholder="EX: AUDITÓRIO CENTRAL - BLOCO A" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                    className="w-full h-20 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                  />
                </div>
                
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Sugestões de locais comuns:</p>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_SUGGESTIONS.map(room => (
                      <button 
                        key={room} 
                        onClick={() => setFormData({...formData, location: room.toUpperCase()})}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all"
                      >
                        {room}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="space-y-3">
              <h2 className="text-[42px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.85]">Banner e <br /><span className="text-primary">Ementa</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Finalize a apresentação visual e textual do seu evento.</p>
            </div>

            <div className="space-y-8">
              <div 
                onClick={() => !isPublishing && fileInputRef.current?.click()}
                className="aspect-video w-full rounded-[3rem] bg-slate-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-white/10 overflow-hidden shadow-inner relative group cursor-pointer transition-all hover:border-primary/50"
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Banner Preview" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-4 opacity-40">
                    <span className="material-symbols-outlined text-6xl">cloud_upload</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Enviar Banner Oficial (PNG/JPG)</p>
                  </div>
                )}
                {uploadProgress && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="size-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-zinc-500 uppercase ml-1">Ementa / Descrição Completa</label>
                <textarea 
                  rows={5}
                  placeholder="Descreva detalhadamente os objetivos e a programação do evento..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] font-bold text-sm dark:text-white outline-none resize-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 lg:p-8 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border-t border-zinc-100 dark:border-white/5 flex gap-5 z-[100] h-32 items-center">
        <div className="max-w-3xl mx-auto w-full flex gap-5">
          <button onClick={handleBack} disabled={isPublishing} className="flex-1 h-16 bg-slate-100 dark:bg-zinc-900 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">Anterior</button>
          <button 
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={isPublishing}
            className="flex-[2] h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
          >
            {isPublishing ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>{step === 3 ? 'Publicar no Portal' : 'Próxima Etapa'} <span className="material-symbols-outlined text-xl">{step === 3 ? 'rocket_launch' : 'arrow_forward'}</span></>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CreateEvent;
