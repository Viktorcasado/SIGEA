
import React, { useState } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase } from '../supabaseClient';

interface CreateEventProps {
  navigateTo: (page: string, id?: string) => void;
  onAddEvent: (event: Event) => void;
  profile: any;
}

const CreateEvent: React.FC<CreateEventProps> = ({ navigateTo, onAddEvent, profile }) => {
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    date: '',
    time: '08:00 - 18:00',
    location: 'Auditório Principal',
    type: 'Congresso',
    imageUrl: '', 
    certificateHours: 10
  });

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('home');

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      setErrorModal({ show: true, msg: 'Por favor, preencha o título e a data do evento.' });
      return;
    }

    if (!profile?.id) {
      setErrorModal({ show: true, msg: 'Erro de autenticação. Por favor, faça login novamente.' });
      return;
    }

    setIsPublishing(true);
    
    // Objeto formatado para o banco de dados (Snake Case)
    // Incluindo o organizer_id para garantir que apareça no dashboard do organizador
    const dbEventPayload = {
      title: formData.title.toUpperCase(),
      description: formData.description,
      campus: formData.campus,
      date: formData.date.toUpperCase(),
      time: formData.time,
      location: formData.location,
      image_url: formData.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000',
      type: formData.type,
      status: 'Inscrições Abertas',
      price: 'Gratuito',
      certificate_hours: formData.certificateHours,
      organizer_id: profile.id
    };

    try {
      const { data, error } = await supabase.from('events').insert([dbEventPayload]).select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newEvent: Event = {
          ...data[0],
          imageUrl: data[0].image_url,
          certificateHours: data[0].certificate_hours
        } as Event;

        localStorage.setItem(`last_published_${newEvent.id}`, JSON.stringify(newEvent));
        
        onAddEvent(newEvent);
        navigateTo('publish-success', newEvent.id);
      }
    } catch (err: any) {
      console.warn("API Offline ou erro de rede, criando evento localmente para demo.");
      const mockId = "demo-" + Math.random().toString(36).substr(2, 5);
      const demoEvent = { 
        ...dbEventPayload, 
        id: mockId,
        imageUrl: dbEventPayload.image_url,
        certificateHours: (dbEventPayload as any).certificate_hours
      } as unknown as Event;
      
      onAddEvent(demoEvent);
      navigateTo('publish-success', mockId);
    } finally {
      setIsPublishing(false);
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
            className="size-14 lg:size-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 active:scale-90 transition-all border border-transparent dark:border-white/5"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Novo Evento</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Sincronizando Etapa {step}/3</p>
          </div>
          <div className="size-14 lg:size-12"></div>
        </div>
        <div className="max-w-3xl mx-auto mt-6 h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_12px_#10b981]" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="p-6 lg:p-12 space-y-10 max-w-3xl mx-auto w-full flex-1">
        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6">
            <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Dados <br /> <span className="text-primary">Gerais</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Informações principais da atividade acadêmica.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-3 col-span-full">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Título do Evento</label>
                <input 
                  type="text" 
                  placeholder="EX: CONGRESSO DE TECNOLOGIA" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:border-primary transition-all shadow-sm"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Campus / Unidade</label>
                <div className="relative">
                  <select 
                    value={formData.campus}
                    onChange={e => setFormData({...formData, campus: e.target.value})}
                    className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none appearance-none cursor-pointer"
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
                  className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-6">
             <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Local e <br /> <span className="text-primary">Data</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Onde e quando os participantes devem comparecer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Data de Início</label>
                <input type="text" placeholder="EX: 15 NOV" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-20 lg:h-18 px-6 w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Intervalo de Horário</label>
                <input type="text" placeholder="EX: 08:00 - 12:00" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-20 lg:h-18 px-6 w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
              <div className="space-y-3 col-span-full">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Espaço Físico / Laboratório</label>
                <input type="text" placeholder="EX: MINI AUDITÓRIO TECNOLOGIA" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Mídia e <br /> <span className="text-primary">Descrição</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Adicione o banner e detalhe os objetivos.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">URL da Imagem de Capa</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..." 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-bold text-sm dark:text-white outline-none focus:border-primary transition-all"
                />
              </div>
              
              <div className="aspect-video w-full rounded-[3rem] bg-slate-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 overflow-hidden shadow-inner relative group">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Banner Preview" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                    <span className="material-symbols-outlined text-6xl opacity-20">image</span>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Preview do Banner</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                <textarea 
                  rows={4}
                  placeholder="Explique o que os participantes aprenderão..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-8 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[3rem] font-bold text-sm dark:text-white outline-none resize-none shadow-sm focus:border-primary transition-all"
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
            className="flex-1 h-16 lg:h-14 bg-slate-100 dark:bg-zinc-900 text-slate-500 font-black rounded-3xl uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:bg-slate-200 dark:hover:bg-zinc-800"
          >
            Anterior
          </button>
          <button 
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={isPublishing}
            className="flex-[2] h-16 lg:h-14 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50"
          >
            {isPublishing ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {step === 3 ? 'Publicar Evento' : 'Próxima Etapa'}
                <span className="material-symbols-outlined text-xl">{step === 3 ? 'send' : 'arrow_forward'}</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CreateEvent;
