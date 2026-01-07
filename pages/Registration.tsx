
import React, { useState, useRef, useEffect } from 'react';
import { Event } from '../types';
import { supabase, isSupabaseConfigured, handleSupabaseError } from '../supabaseClient';
import { CAMPUS_LIST } from '../constants';

interface RegistrationProps {
  navigateTo: (page: string, id?: string) => void;
  eventId: string | null;
  events: Event[];
  profile: { id: string; name: string; email: string; photo: string; campus: string };
  onUpdateProfile: (updatedProfile: any) => Promise<void> | void;
}

type UserRoleOption = 'Estudante' | 'Servidor' | 'Externo';

const Registration: React.FC<RegistrationProps> = ({ navigateTo, eventId, events, profile, onUpdateProfile }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRoleOption>('Estudante');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    cpf: '',
    campus: profile.campus || CAMPUS_LIST[0],
    matricula: '',
    siape: '',
    photo: profile.photo || '',
    terms: false
  });

  // Efeito para sincronizar quando o perfil carregar do Supabase
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        photo: profile.photo || prev.photo,
        campus: profile.campus || prev.campus
      }));
    }
  }, [profile]);

  const event = events.find(e => e.id === eventId) || events[0];
  if (!event) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!isSupabaseConfigured()) {
      alert("Configuração de sistema não detectada. Inscrição local apenas.");
      navigateTo('ticket', event.id);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Salva a inscrição
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
          photo_url: formData.photo,
          status: 'Confirmado'
        }]);

      if (regError) throw regError;

      // 2. Sincroniza dados com o perfil global no Supabase
      await onUpdateProfile({
        name: formData.name,
        photo: formData.photo,
        campus: formData.campus
      });

      navigateTo('ticket', event.id);
    } catch (err: any) {
      alert("Falha na inscrição: " + handleSupabaseError(err));
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
    <div className="relative flex flex-col w-full pb-32 min-h-screen bg-background-light dark:bg-zinc-950 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center justify-between px-6 py-6">
          <button onClick={handleBack} className="size-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 active:scale-90 transition-all">
            <span className="material-symbols-outlined font-bold">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Confirmar Dados</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Etapa {step} de 3</p>
          </div>
          <div className="size-10"></div>
        </div>
        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full bg-primary transition-all duration-500" style={{width: `${(step / 3) * 100}%`}}></div>
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
                {formData.photo ? (
                  <img src={formData.photo} className="w-full h-full object-cover" alt="Perfil" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-zinc-300">add_a_photo</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white">edit</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-4">Foto para Credenciamento</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Seu Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 px-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase ml-4 tracking-widest">E-mail</label>
                <input 
                  type="email" 
                  value={formData.email}
                  readOnly
                  className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm font-bold text-zinc-400 outline-none"
                />
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6 animate-in slide-in-from-right-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Categoria de Vínculo</label>
              <div className="grid gap-3">
                {(['Estudante', 'Servidor', 'Externo'] as UserRoleOption[]).map((opt) => (
                  <button 
                    key={opt}
                    onClick={() => setRole(opt)}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                      role === opt ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5'
                    }`}
                  >
                    <span className={`text-sm font-black uppercase ${role === opt ? 'text-primary' : 'text-zinc-600 dark:text-zinc-400'}`}>{opt}</span>
                    {role === opt && <span className="material-symbols-outlined text-primary">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Seu Campus Oficial</label>
              <select 
                value={formData.campus}
                onChange={e => setFormData({...formData, campus: e.target.value})}
                className="w-full h-14 px-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white appearance-none"
              >
                {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-8 animate-in zoom-in-95">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-white/5 text-center">
              <div className="size-24 rounded-full bg-cover bg-center mx-auto mb-6 ring-4 ring-primary/20 shadow-lg" style={{backgroundImage: `url(${formData.photo || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200'})`}}></div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-tight">{formData.name}</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{role} • {formData.campus}</p>
              
              <div className="mt-10 pt-8 border-t border-zinc-50 dark:border-white/5">
                <label className="flex items-start gap-4 text-left cursor-pointer" onClick={() => setFormData({...formData, terms: !formData.terms})}>
                  <div className={`mt-1 size-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.terms ? 'bg-primary border-primary' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-white/10'}`}>
                    {formData.terms && <span className="material-symbols-outlined text-white text-lg">check</span>}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase leading-relaxed tracking-tight">
                    Declaro que os dados acima são verdadeiros e autorizo a atualização do meu perfil institucional no SIGEA.
                  </p>
                </label>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-100 dark:border-white/5 p-6 z-[100] max-w-md mx-auto h-28 flex gap-4">
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
            <>
              {step < 3 ? 'Próximo Passo' : 'Confirmar Inscrição'}
              <span className="material-symbols-outlined text-xl">{step < 3 ? 'arrow_forward' : 'verified'}</span>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default Registration;
