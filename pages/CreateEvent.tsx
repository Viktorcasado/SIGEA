
import React, { useState, useRef } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, isSupabaseConfigured, handleSupabaseError } from '../supabaseClient';

interface CreateEventProps {
  navigateTo: (page: string, id?: string) => void;
  onAddEvent: (event: Event) => void;
}

const CreateEvent: React.FC<CreateEventProps> = ({ navigateTo, onAddEvent }) => {
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const isDemoMode = localStorage.getItem('sigea_demo') === 'true';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    date: '',
    time: '08:00 - 18:00',
    location: 'Auditório Principal',
    type: 'Palestra' as any,
    imageUrl: 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?w=800',
    certificateHours: 10
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else navigateTo('home');
  };

  const handleSubmit = async () => {
    setIsPublishing(true);

    // Lógica para o Modo Demonstração (Evita erro de rede)
    if (isDemoMode) {
      setTimeout(() => {
        const demoEvent: Event = {
          ...formData,
          id: 'demo-' + Math.random().toString(36).substr(2, 9),
          status: 'Inscrições Abertas',
          price: 'Gratuito'
        };
        onAddEvent(demoEvent);
        setIsPublishing(false);
        navigateTo('publish-success', demoEvent.id);
      }, 1500);
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorModal({ 
        show: true, 
        msg: "Chaves de sistema não configuradas. Ative o Modo Demonstração para testar sem banco de dados." 
      });
      setIsPublishing(false);
      return;
    }
    
    const dbEvent = {
      title: formData.title,
      description: formData.description,
      campus: formData.campus,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      imageUrl: formData.imageUrl,
      type: formData.type,
      status: 'Inscrições Abertas',
      price: 'Gratuito',
      certificateHours: formData.certificateHours
    };

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([dbEvent])
        .select();
      
      if (error) throw error;

      if (data && data[0]) {
        onAddEvent(data[0] as Event);
        navigateTo('publish-success', data[0].id);
      }
    } catch (err: any) {
      setErrorModal({ show: true, msg: handleSupabaseError(err) });
    } finally {
      setIsPublishing(false);
    }
  };

  const eventTypes = [
    { name: 'Palestra', icon: 'mic_external_on' },
    { name: 'Workshop', icon: 'build' },
    { name: 'Curso', icon: 'menu_book' },
    { name: 'Congresso', icon: 'groups' },
    { name: 'Simpósio', icon: 'school' },
    { name: 'Seminário', icon: 'history_edu' },
    { name: 'Mesa Redonda', icon: 'forum' },
    { name: 'Fórum', icon: 'campaign' },
    { name: 'Exposição', icon: 'gallery_thumbnail' },
    { name: 'Hackathon', icon: 'terminal' },
    { name: 'Mentoria', icon: 'psychology' }
  ];

  return (
    <div className="relative flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500">
      
      {/* Modal de Erro Customizado (Igual à Imagem) */}
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-zinc-900/90 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col items-center text-center scale-up-center">
            <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
               <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <p className="text-sm font-bold leading-relaxed text-zinc-300 mb-8 px-2">
              {errorModal.msg}
            </p>
            <button 
              onClick={() => setErrorModal({ show: false, msg: '' })}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-primary font-black uppercase text-xs tracking-[0.3em] rounded-2xl transition-all active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center justify-between px-6 py-6">
          <button onClick={handleBack} className="size-11 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 active:scale-90 transition-all border border-transparent dark:border-white/5">
            <span className="material-symbols-outlined font-black">{step === 1 ? 'close' : 'arrow_back'}</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.3em]">Criar Evento</h1>
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Etapa {step} de 3</p>
          </div>
          <div className="size-11"></div>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900">
          <div 
            className="h-full bg-primary shadow-[0_0_12px_#10b981] transition-all duration-700 ease-out"
            style={{width: `${(step / 3) * 100}%`}}
          ></div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {step === 1 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">Definições Básicas</h3>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Identidade e Classificação</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Título do Evento</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl outline-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all dark:text-white shadow-sm" 
                  placeholder="Ex: I Seminário de Inovação e Tecnologia" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Modalidade Acadêmica</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {eventTypes.map((t) => (
                    <button 
                      key={t.name}
                      onClick={() => setFormData({...formData, type: t.name as any})}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 active:scale-95 ${
                        formData.type === t.name 
                        ? 'bg-primary/10 border-primary text-primary shadow-lg ring-1 ring-primary/20' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 text-zinc-400'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-3xl ${formData.type === t.name ? 'filled' : ''}`}>
                        {t.icon}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-tight text-center leading-none">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Certificação (Horas)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.certificateHours}
                    onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})}
                    className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl outline-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all dark:text-white shadow-sm" 
                    placeholder="Ex: 20" 
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-300 uppercase">Horas Acadêmicas</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">Local e Agenda</h3>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cronograma Institucional</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Unidade IFAL</label>
                <select 
                  value={formData.campus}
                  onChange={e => setFormData({...formData, campus: e.target.value})}
                  className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl outline-none text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all dark:text-white appearance-none shadow-sm"
                >
                  {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Data de Realização</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary">calendar_month</span>
                    <input 
                      type="text" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full h-16 pl-14 pr-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl outline-none text-sm font-bold dark:text-white shadow-sm" 
                      placeholder="Ex: 12 a 15 Out" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Horário Previsto</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary">schedule</span>
                    <input 
                      type="text" 
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full h-16 pl-14 pr-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl outline-none text-sm font-bold dark:text-white shadow-sm" 
                      placeholder="Ex: 08:00 - 17:00" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Localização Específica</label>
                <div className="relative">
                   <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary">location_on</span>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full h-16 pl-14 pr-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl outline-none text-sm font-bold dark:text-white shadow-sm" 
                    placeholder="Ex: Auditório Central, Bloco B, Sala 02" 
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase text-zinc-900 dark:text-white">Apresentação</h3>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Imagem de capa e descrição do evento.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">BANNER (URL OU UPLOAD)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[21/9] rounded-[2.5rem] bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer group overflow-hidden relative shadow-2xl transition-all hover:border-primary/50"
                >
                  {formData.imageUrl ? (
                    <>
                      <img 
                        src={formData.imageUrl} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                        alt="Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="material-symbols-outlined text-white text-4xl">add_a_photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-zinc-300">
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <span className="material-symbols-outlined text-3xl">image</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Carregar Capa do Evento</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[2.5rem] outline-none text-sm font-bold placeholder:text-zinc-400 resize-none dark:text-white shadow-sm focus:ring-4 focus:ring-primary/10 transition-all" 
                  placeholder="Informações sobre palestrantes, pautas e requisitos para participação..." 
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-3xl border-t border-white/20 dark:border-white/5 p-6 z-[100] max-w-2xl mx-auto h-28 flex gap-4">
        <button 
          onClick={handleBack}
          className="flex-1 px-4 rounded-2xl border-2 border-zinc-100 dark:border-white/5 text-zinc-600 dark:text-zinc-400 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all hover:bg-zinc-50 dark:hover:bg-white/5"
        >
          Voltar
        </button>
        <button 
          onClick={step === 3 ? handleSubmit : handleNext}
          disabled={isPublishing}
          className="flex-[2] bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all disabled:opacity-70 border border-white/20"
        >
          {isPublishing ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">
                {step < 3 ? 'arrow_forward' : 'rocket_launch'}
              </span>
            </div>
          )}
        </button>
      </footer>
    </div>
  );
};

export default CreateEvent;
