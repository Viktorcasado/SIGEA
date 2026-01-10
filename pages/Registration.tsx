
import React, { useState, useRef, useEffect } from 'react';
import { Event } from '../types.ts';
import { supabase, isSupabaseConfigured, handleSupabaseError, uploadFile } from '../supabaseClient.ts';
import { CAMPUS_LIST } from '../constants.tsx';

interface RegistrationProps {
  navigateTo: (page: string, id?: string) => void;
  eventId: string | null;
  events: Event[];
  profile: { id: string; name: string; email: string; photo: string; campus: string };
  onUpdateProfile: (updatedProfile: any) => Promise<boolean> | void;
}

type UserRoleOption = 'Estudante' | 'Servidor' | 'Externo';

const Registration: React.FC<RegistrationProps> = ({ navigateTo, eventId, events, profile, onUpdateProfile }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRoleOption>('Estudante');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    cpf: '',
    campus: profile.campus || CAMPUS_LIST[0],
    matricula: '',
    siape: '',
    photoPreview: profile.photo || '',
    terms: false
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        photoPreview: profile.photo || prev.photoPreview,
        campus: profile.campus || prev.campus || CAMPUS_LIST[0]
      }));
    }
  }, [profile]);

  const event = events.find(e => e.id === eventId) || events[0];
  if (!event) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A foto é muito pesada (máx 2MB). Escolha outra.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoPreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!formData.terms) return;
    setIsSubmitting(true);
    
    try {
      let finalPhotoUrl = profile.photo;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `reg-${profile.id}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${profile.id}/${fileName}`;
        finalPhotoUrl = await uploadFile('assets', filePath, selectedFile);
      }

      await onUpdateProfile({
        name: formData.name,
        photo_url: finalPhotoUrl,
        campus: formData.campus
      });

      if (isSupabaseConfigured()) {
        const { error: regError } = await supabase
          .from('registrations')
          .insert([{
            event_id: event.id,
            user_id: profile.id,
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf,
            role: role,
            campus: formData.campus,
            registration_number: role === 'Estudante' ? formData.matricula : formData.siape,
            photo_url: finalPhotoUrl,
            status: 'Confirmado'
          }]);

        if (regError) throw regError;
      }

      if (window.navigator.vibrate) window.navigator.vibrate([20, 50, 20]);
      navigateTo('ticket', event.id);
    } catch (err: any) {
      const errorMsg = handleSupabaseError(err);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else handleConfirmRegistration();
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else navigateTo('details', event.id);
  };

  return (
    <div className="relative flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500 overflow-x-hidden">
      {showCampusModal && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCampusModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#121214] rounded-t-[3rem] p-8 max-h-[70vh] overflow-hidden flex flex-col shadow-2xl border-t border-primary/20">
            <header className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex flex-col">
                <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Instituições</h3>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Selecione sua unidade oficial</p>
              </div>
              <button onClick={() => setShowCampusModal(false)} className="size-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10">
              {CAMPUS_LIST.map((c) => {
                const isSelected = formData.campus === c;
                return (
                  <div 
                    key={c} 
                    onClick={() => { 
                      if (window.navigator.vibrate) window.navigator.vibrate(5);
                      setFormData({...formData, campus: c}); 
                      setShowCampusModal(false); 
                    }} 
                    className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer ${isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-transparent hover:border-slate-200'}`}
                  >
                    <span className={`text-xs font-bold uppercase ${isSelected ? 'text-primary font-black' : 'text-slate-600 dark:text-zinc-400'}`}>{c}</span>
                    {isSelected && <span className="material-symbols-outlined text-primary">check_circle</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center justify-between px-6 py-6">
          <button 
            onClick={handleBack} 
            className="size-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white shadow-xl shadow-black/5 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] font-black">{step === 1 ? 'close' : 'arrow_back_ios_new'}</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Inscrição</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Etapa {step} de 3</p>
          </div>
          <div className="size-12"></div>
        </div>
      </header>

      <main className="flex-1 p-6">
        {step === 1 && (
          <section className="space-y-8 animate-in slide-in-from-bottom-4">
            <div className="text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative size-32 rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 mx-auto border-2 border-dashed border-zinc-200 dark:border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group shadow-inner transition-all hover:border-primary/50"
              >
                {formData.photoPreview ? (
                  <img src={formData.photoPreview} className="w-full h-full object-cover" alt="Perfil" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-zinc-300">add_a_photo</span>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-4">Foto de Identificação</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 px-2">
                <label className="text-[11px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white"
                />
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-8 animate-in zoom-in-95">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-white/5 text-center relative overflow-hidden">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-tight">{formData.name}</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{role} • {formData.campus}</p>
              
              <div className="mt-10 pt-8 border-t border-zinc-50 dark:border-white/5">
                <label className="flex items-start gap-4 text-left cursor-pointer" onClick={() => setFormData({...formData, terms: !formData.terms})}>
                  <div className={`mt-1 size-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.terms ? 'bg-primary border-primary' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-white/10'}`}>
                    {formData.terms && <span className="material-symbols-outlined text-white text-lg">check</span>}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase leading-relaxed tracking-tight">
                    Confirmo minha unidade oficial e autorizo o processamento de dados.
                  </p>
                </label>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-100 dark:border-white/5 p-6 z-[100] h-28 flex gap-4">
        {step > 1 && (
          <button onClick={handleBack} className="flex-1 px-4 rounded-2xl border-2 border-zinc-100 dark:border-white/5 text-zinc-600 dark:text-zinc-400 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
            Voltar
          </button>
        )}
        <button 
          onClick={handleNext}
          disabled={isSubmitting || (step === 3 && !formData.terms)}
          className="flex-[2] bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>{step < 3 ? 'Próximo' : 'Finalizar'}</>
          )}
        </button>
      </footer>
    </div>
  );
};

export default Registration;
