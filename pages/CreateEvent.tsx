
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
    type: 'Palestra' as any,
    imageUrl: '', // Começa vazio para incentivar o link direto
    certificateHours: 10
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bannerSuggestions = [
    { name: 'Tecnologia', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800' },
    { name: 'Workshop', url: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800' },
    { name: 'Educação', url: 'https://images.unsplash.com/photo-1523240715181-014b9e81980e?w=800' }
  ];

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('home');

  const handleSubmit = async () => {
    setIsPublishing(true);
    
    const dbEvent = {
      title: formData.title,
      description: formData.description,
      campus: formData.campus,
      date: formData.date,
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
      }
    } catch (err: any) {
      setErrorModal({ show: true, msg: handleSupabaseError(err) });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in">
      {errorModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] text-center max-w-xs">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
            <p className="text-white text-xs font-bold mb-6">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full py-4 bg-zinc-800 text-primary font-black rounded-2xl">ENTENDI</button>
          </div>
        </div>
      )}

      <header className="p-6 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="size-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500"><span className="material-symbols-outlined">arrow_back</span></button>
          <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Novo Evento</h1>
            <p className="text-[9px] font-bold text-primary uppercase">Passo {step} de 3</p>
          </div>
          <div className="size-10"></div>
        </div>
        <div className="h-1 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-xl mx-auto w-full">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Informações Básicas</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="TÍTULO DO EVENTO" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-bold dark:text-white outline-none focus:border-primary transition-all"
              />
              <select 
                value={formData.campus}
                onChange={e => setFormData({...formData, campus: e.target.value})}
                className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-bold dark:text-white outline-none"
              >
                {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Data e Local</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="DATA (EX: 20 OUT)" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-bold dark:text-white outline-none" />
              <input type="text" placeholder="HORÁRIO" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-bold dark:text-white outline-none" />
            </div>
            <input type="text" placeholder="LOCAL EXATO" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-bold dark:text-white outline-none" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Mídia e Descrição</h2>
            <div className="space-y-4">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary">link</span>
                <input 
                  type="text" 
                  placeholder="LINK DIRETO DA IMAGEM (URL)" 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full h-16 pl-14 pr-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl font-bold dark:text-white outline-none focus:border-primary transition-all"
                />
              </div>
              
              <div className="aspect-video w-full rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 overflow-hidden shadow-inner relative">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.currentTarget.src = bannerSuggestions[0].url)} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                    <span className="material-symbols-outlined text-4xl mb-2">image</span>
                    <p className="text-[9px] font-black uppercase tracking-widest">Insira o link acima para ver a prévia</p>
                  </div>
                )}
              </div>

              <textarea 
                rows={4}
                placeholder="DESCRIÇÃO DO EVENTO..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[2rem] font-bold dark:text-white outline-none resize-none"
              />
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-100 dark:border-white/5 flex gap-4">
        <button onClick={handleBack} className="flex-1 h-16 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">Voltar</button>
        <button 
          onClick={step === 3 ? handleSubmit : handleNext}
          disabled={isPublishing}
          className="flex-[2] h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95 transition-all disabled:opacity-50"
        >
          {isPublishing ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (step === 3 ? 'Publicar Evento' : 'Próximo')}
          <span className="material-symbols-outlined">{step === 3 ? 'rocket_launch' : 'arrow_forward'}</span>
        </button>
      </footer>
    </div>
  );
};

export default CreateEvent;
