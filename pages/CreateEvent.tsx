
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
    if (!isSupabaseConfigured()) {
      alert("Chaves de sistema não configuradas. Publicação local apenas.");
      navigateTo('home');
      return;
    }

    setIsPublishing(true);
    
    // Nomes de campos idênticos ao Script SQL (imageUrl, certificateHours)
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
      alert(`Falha ao publicar: ${handleSupabaseError(err)}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const eventTypes = [
    { name: 'Palestra', icon: 'mic_external_on' },
    { name: 'Workshop', icon: 'build' },
    { name: 'Curso', icon: 'menu_book' },
    { name: 'Congresso', icon: 'groups' }
  ];

  return (
    <div className="relative flex flex-col w-full pb-32 min-h-screen bg-background-light dark:bg-background-dark animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between px-6 py-6">
          <button onClick={handleBack} className="size-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 active:scale-90 transition-all">
            <span className="material-symbols-outlined font-bold">{step === 1 ? 'close' : 'arrow_back'}</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Criar Evento</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Etapa {step} de 3</p>
          </div>
          <div className="size-10"></div>
        </div>
        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{width: `${(step / 3) * 100}%`}}
          ></div>
        </div>
      </header>

      <main className="flex-1 p-6">
        {step === 1 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">O que você está organizando?</h3>
              <p className="text-xs font-medium text-zinc-500">Defina os detalhes básicos da atividade.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Título</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full h-14 px-6 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="Nome do Evento Acadêmico" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  {eventTypes.map((t) => (
                    <button 
                      key={t.name}
                      onClick={() => setFormData({...formData, type: t.name as any})}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        formData.type === t.name 
                        ? 'bg-primary/5 border-primary' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${formData.type === t.name ? 'text-primary filled' : 'text-zinc-400'}`}>
                        {t.icon}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-tight ${formData.type === t.name ? 'text-primary' : 'text-zinc-500'}`}>
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Horas Complementares</label>
                <input 
                  type="number" 
                  value={formData.certificateHours}
                  onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})}
                  className="w-full h-14 px-6 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="Carga Horária (ex: 10)" 
                />
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Onde e Quando?</h3>
              <p className="text-xs font-medium text-zinc-500">Localização e período do evento.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Campus</label>
                <select 
                  value={formData.campus}
                  onChange={e => setFormData({...formData, campus: e.target.value})}
                  className="w-full h-14 px-6 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                >
                  {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Data</label>
                  <input 
                    type="text" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full h-14 px-6 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl outline-none text-sm font-bold" 
                    placeholder="Ex: 15 de Jun" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Horário</label>
                  <input 
                    type="text" 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full h-14 px-6 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl outline-none text-sm font-bold" 
                    placeholder="08:00 - 18:00" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Sala / Auditório</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full h-14 px-6 bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl outline-none text-sm font-bold" 
                  placeholder="Auditório Central, Bloco B..." 
                />
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Apresentação</h3>
              <p className="text-xs font-medium text-zinc-500">Imagem de capa e descrição do evento.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Banner (URL ou Upload)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-3xl bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer group overflow-hidden relative"
                >
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-400">
                      <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Imagem</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Descrição</label>
                <textarea 
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-6 bg-zinc-100 dark:bg-zinc-900 border-none rounded-3xl outline-none text-sm font-bold placeholder:text-zinc-400 resize-none" 
                  placeholder="Detalhes sobre palestrantes, objetivos e programação..." 
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-100 dark:border-zinc-800 p-6 z-[100] max-w-md mx-auto h-28 flex gap-4">
        {step > 1 && (
          <button 
            onClick={handleBack}
            className="flex-1 px-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
          >
            Voltar
          </button>
        )}
        <button 
          onClick={step === 3 ? handleSubmit : handleNext}
          disabled={isPublishing}
          className="flex-[2] bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all disabled:opacity-70"
        >
          {isPublishing ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              {step < 3 ? 'Próximo' : 'Publicar Evento'}
              <span className="material-symbols-outlined text-xl">
                {step < 3 ? 'arrow_forward' : 'rocket_launch'}
              </span>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default CreateEvent;
