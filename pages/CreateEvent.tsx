
import React, { useState, useRef } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, handleSupabaseError } from '../supabaseClient';

interface CreateEventProps {
  navigateTo: (page: string, id?: string) => void;
  onAddEvent: (event: Event) => void;
}

const CreateEvent: React.FC<CreateEventProps> = ({ navigateTo, onAddEvent }) => {
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
  
  const bannerSuggestions = [
    { name: 'Tech', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000' },
    { name: 'Workshop', url: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1000' },
    { name: 'Aula', url: 'https://images.unsplash.com/photo-1523240715181-014b9e81980e?w=1000' }
  ];

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('home');

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      setErrorModal({ show: true, msg: 'Por favor, preencha o título e a data do evento.' });
      return;
    }

    setIsPublishing(true);
    
    const dbEvent = {
      title: formData.title.toUpperCase(),
      description: formData.description,
      campus: formData.campus,
      date: formData.date.toUpperCase(),
      time: formData.time,
      location: formData.location,
      imageUrl: formData.imageUrl || bannerSuggestions[0].url,
      type: formData.type,
      status: 'Inscrições Abertas',
      price: 'Gratuito',
      certificateHours: formData.certificateHours
    };

    try {
      const { data, error } = await supabase.from('events').insert([dbEvent]).select();
      if (error) throw error;
      if (data && data[0]) {
        onAddEvent(data[0] as Event);
        navigateTo('publish-success', data[0].id);
      } else {
        // Fallback para demo offline
        const mockId = Math.random().toString(36).substr(2, 9);
        const demoEvent = { ...dbEvent, id: mockId } as Event;
        onAddEvent(demoEvent);
        navigateTo('publish-success', mockId);
      }
    } catch (err: any) {
      // Se falhar a conexão, usamos o mock para não travar a experiência
      console.warn("API Offline, criando evento localmente.");
      const mockId = "demo-" + Math.random().toString(36).substr(2, 5);
      const demoEvent = { ...dbEvent, id: mockId } as Event;
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
          <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] text-center max-w-xs shadow-2xl">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-white text-xs font-black uppercase tracking-tight mb-8 leading-relaxed">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-14 bg-zinc-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">OK, ENTENDI</button>
          </div>
        </div>
      )}

      <header className="p-8 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack} 
            className="size-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 active:scale-90 transition-all border border-transparent dark:border-white/5"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-[11px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Publicar</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Passo {step} de 3</p>
          </div>
          <div className="size-12"></div>
        </div>
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_12px_#10b981]" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="p-8 space-y-10 max-w-xl mx-auto w-full">
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6">
            <div className="space-y-2">
              <h2 className="text-[32px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">O que vai <br /> <span className="text-primary">Acontecer?</span></h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Defina os detalhes fundamentais do seu evento.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Título Institucional</label>
                <input 
                  type="text" 
                  placeholder="EX: I SEMANA DE BIOLOGIA" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full h-18 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:border-primary transition-all shadow-sm placeholder:text-zinc-300 dark:placeholder:text-zinc-800"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Unidade Realizadora</label>
                <div className="relative">
                  <select 
                    value={formData.campus}
                    onChange={e => setFormData({...formData, campus: e.target.value})}
                    className="w-full h-18 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Carga Horária (Certificado)</label>
                <input 
                  type="number" 
                  value={formData.certificateHours}
                  onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})}
                  className="w-full h-18 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-6">
             <div className="space-y-2">
              <h2 className="text-[32px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">Onde e <br /> <span className="text-primary">Quando?</span></h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Informações logísticas para os participantes.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Data</label>
                <input type="text" placeholder="25 OUT" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-18 px-6 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Horário</label>
                <input type="text" placeholder="08H - 18H" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-18 px-6 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none shadow-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Localização no Campus</label>
              <input type="text" placeholder="EX: AUDITÓRIO CENTRAL" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full h-18 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none shadow-sm" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
             <div className="space-y-2">
              <h2 className="text-[32px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">Identidade <br /> <span className="text-primary">Visual</span></h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Adicione um link direto de imagem para o banner.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Link Direto da Imagem (URL)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary">link</span>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/..." 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full h-18 pl-14 pr-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl font-bold text-sm dark:text-white outline-none focus:border-primary transition-all shadow-sm"
                  />
                </div>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-2">Dica: Use links do Unsplash ou do site institucional do IFAL.</p>
              </div>
              
              <div className="aspect-[16/9] w-full rounded-[3rem] bg-slate-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 overflow-hidden shadow-inner relative ring-1 ring-black/5">
                {formData.imageUrl ? (
                  <img 
                    src={formData.imageUrl} 
                    className="w-full h-full object-cover" 
                    alt="Banner Preview" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }} 
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                    <span className="material-symbols-outlined text-5xl">image_search</span>
                    <p className="text-[9px] font-[900] uppercase tracking-[0.3em] opacity-50">Aguardando URL válida</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Sobre o Evento (Descrição)</label>
                <textarea 
                  rows={4}
                  placeholder="DESCREVA OS OBJETIVOS E PÚBLICO-ALVO..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] font-bold text-sm dark:text-white outline-none resize-none shadow-sm focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl border-t border-zinc-100 dark:border-white/5 flex gap-5 z-[100] h-32 items-center">
        <button 
          onClick={handleBack} 
          className="flex-1 h-16 bg-slate-100 dark:bg-zinc-900 text-slate-500 font-black rounded-3xl uppercase text-[10px] tracking-widest active:scale-95 transition-all"
        >
          Voltar
        </button>
        <button 
          onClick={step === 3 ? handleSubmit : handleNext}
          disabled={isPublishing}
          className="flex-[2] h-16 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em] active:scale-95 transition-all disabled:opacity-50"
        >
          {isPublishing ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              {step === 3 ? 'Publicar no SIGEA' : 'Próxima Etapa'}
              <span className="material-symbols-outlined text-xl">{step === 3 ? 'rocket_launch' : 'arrow_forward'}</span>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default CreateEvent;
