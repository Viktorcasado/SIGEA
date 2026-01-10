
import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { CAMPUS_LIST } from '../constants';

interface ProfileProps {
  navigateTo: (page: string) => void;
  toggleRole: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (val: 'light' | 'dark' | 'system') => void;
  role: UserRole;
  profile: { id: string; name: string; photo: string; campus: string; email: string } | null;
  onUpdate: (data: any) => Promise<{success: boolean, error?: string, localOnly?: boolean}>;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

const ADMIN_EMAIL = 'viktorcasado@gmail.com';

const Profile: React.FC<ProfileProps> = ({ 
  navigateTo, toggleRole, theme, setTheme, role, profile, onUpdate, onLogout, onDeleteAccount 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCampusSelector, setShowCampusSelector] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(() => {
    return localStorage.getItem('sigea_biometry_enabled') === 'true';
  });
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  
  const [formData, setFormData] = useState({ 
    name: '', 
    photo: '', 
    campus: CAMPUS_LIST[0],
    email: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    if (profile) {
      setFormData({ 
        name: profile.name || '', 
        photo: profile.photo || '', 
        campus: profile.campus || CAMPUS_LIST[0],
        email: profile.email || ''
      }); 
    }
  }, [profile]);

  if (!profile) return null;

  const isAdmin = profile.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleToggleBiometry = async () => {
    if (!window.PublicKeyCredential) {
      setErrorModal({ show: true, msg: 'Este dispositivo não suporta autenticação biométrica via navegador.' });
      return;
    }

    if (!isBiometricEnabled) {
      // Simulação de registro WebAuthn
      try {
        if (window.navigator.vibrate) window.navigator.vibrate([10, 30]);
        // Em produção, aqui chamaríamos o desafio do servidor e navigator.credentials.create
        const confirmed = confirm("Deseja vincular sua biometria (FaceID/Digital) a esta conta para acessos rápidos?");
        if (confirmed) {
          localStorage.setItem('sigea_biometry_enabled', 'true');
          setIsBiometricEnabled(true);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        }
      } catch (e) {
        setErrorModal({ show: true, msg: 'Falha ao configurar biometria.' });
      }
    } else {
      localStorage.removeItem('sigea_biometry_enabled');
      setIsBiometricEnabled(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorModal({ show: true, msg: 'A imagem é muito grande. O limite máximo é 5MB.' });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { 
        setFormData(prev => ({ ...prev, photo: reader.result as string })); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const result = await onUpdate({ name: formData.name, campus: formData.campus, imageFile: selectedFile });
      if (result.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        if (window.navigator.vibrate) window.navigator.vibrate([10, 30, 10]);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorModal({ show: true, msg: result.error || 'Erro ao salvar.' });
      }
    } catch (error) { 
      setErrorModal({ show: true, msg: 'Erro técnico ao salvar perfil.' });
    } finally { setIsSaving(false); }
  };

  const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US';

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in zoom-in">
          <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-white text-xs font-black uppercase tracking-tight mb-8 leading-relaxed">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-16 bg-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">OK</button>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-4">
          Preferências Salvas!
        </div>
      )}

      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-50 border-b border-transparent dark:border-white/5">
        <button onClick={() => isEditing ? setIsEditing(false) : navigateTo('home')} className="size-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white shadow-xl active:scale-90 transition-all"><span className="material-symbols-outlined text-[20px] font-black">{isEditing ? 'close' : 'arrow_back_ios_new'}</span></button>
        <h2 className="text-[12px] font-[900] uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500">{isEditing ? 'Ajustes' : 'Perfil'}</h2>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving} className={`size-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 shadow-2xl ${isEditing ? 'bg-primary text-white shadow-primary/30' : 'bg-primary/10 text-primary border border-primary/20'}`}>{isSaving ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined">{isEditing ? 'check' : 'edit_square'}</span>}</button>
      </header>

      <main className="px-6 flex flex-col items-center">
        <div className="w-full max-sm mb-10 p-2 bg-slate-200/50 dark:bg-zinc-900/50 rounded-[2rem] border border-white/5">
           <div className="flex p-1 gap-1">
              <button onClick={() => (isAdmin || role === UserRole.ORGANIZER) && toggleRole()} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.PARTICIPANT ? 'bg-white dark:bg-zinc-800 text-primary shadow-xl' : 'text-slate-400'}`}><span className="material-symbols-outlined text-lg">person</span> Participante</button>
              <button onClick={() => (isAdmin || role === UserRole.PARTICIPANT) && toggleRole()} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.ORGANIZER ? 'bg-white dark:bg-zinc-800 text-primary shadow-xl' : 'text-slate-400'}`}><span className="material-symbols-outlined text-lg">admin_panel_settings</span> Organizador</button>
           </div>
        </div>

        <div className="flex flex-col items-center mb-12 w-full pt-2">
          <div className="relative mb-8">
            <div onClick={() => isEditing && fileInputRef.current?.click()} className={`size-40 rounded-[3.5rem] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-6xl font-[900] tracking-tighter ring-[12px] ring-white dark:ring-zinc-900 shadow-2xl overflow-hidden transition-all ${isEditing ? 'cursor-pointer hover:scale-105' : ''}`}>
               {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" alt="Profile" /> : initials}
               {isEditing && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"><span className="material-symbols-outlined text-white text-4xl">add_a_photo</span></div>}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 max-w-sm">
              <div className="space-y-1.5 px-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Nome Completo</label>
                <input type="text" value={formData.name} onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl text-sm font-bold outline-none text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-1.5 px-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Unidade/Campus</label>
                <div onClick={() => setShowCampusSelector(true)} className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl text-sm font-bold flex items-center justify-between cursor-pointer"><span className="truncate">{formData.campus}</span><span className="material-symbols-outlined text-primary">expand_more</span></div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 animate-in fade-in duration-700 w-full max-w-sm">
              <h1 className="text-3xl font-[900] text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">{formData.name}</h1>
              <p className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{formData.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mt-2">
                 <span className="material-symbols-outlined text-primary text-sm">school</span>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">{formData.campus}</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm space-y-6 pt-10 pb-20">
          
          {/* Segurança Biométrica */}
          <div className="p-8 bg-white dark:bg-zinc-900/40 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-6">
            <div className="flex flex-col gap-1 px-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Segurança Digital</p>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Login Biométrico</h3>
            </div>
            
            <button 
              onClick={handleToggleBiometry}
              className={`w-full p-6 rounded-[2rem] flex items-center justify-between transition-all border ${isBiometricEnabled ? 'bg-primary/5 border-primary shadow-inner' : 'bg-slate-50 dark:bg-zinc-800 border-transparent'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`size-11 rounded-xl flex items-center justify-center ${isBiometricEnabled ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'}`}>
                  <span className="material-symbols-outlined">{isBiometricEnabled ? 'fingerprint' : 'no_encryption'}</span>
                </div>
                <div className="text-left">
                  <p className={`text-[11px] font-black uppercase ${isBiometricEnabled ? 'text-primary' : 'text-slate-600 dark:text-zinc-400'}`}>
                    {isBiometricEnabled ? 'Ativado (FaceID/Digital)' : 'Desativado'}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {isBiometricEnabled ? 'Proteção Biométrica Ativa' : 'Use apenas e-mail e senha'}
                  </p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${isBiometricEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-zinc-600'}`}>
                <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${isBiometricEnabled ? 'left-7' : 'left-1'}`}></div>
              </div>
            </button>
          </div>

          {/* Theme Selector Section */}
          <div className="p-8 bg-white dark:bg-zinc-900/40 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-6">
            <div className="flex flex-col gap-1 px-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Personalização</p>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Tema do App</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl">
              {[
                { id: 'light', label: 'Claro', icon: 'light_mode' },
                { id: 'dark', label: 'Escuro', icon: 'dark_mode' },
                { id: 'system', label: 'Sistema', icon: 'settings_brightness' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (window.navigator.vibrate) window.navigator.vibrate(5);
                    setTheme(t.id as any);
                  }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                    theme === t.id 
                    ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{t.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => navigateTo('help')} className="w-full p-8 bg-white dark:bg-zinc-900/40 rounded-[3rem] border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-5">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-3xl">contact_support</span></div>
              <div className="text-left">
                <p className="text-[15px] font-black text-slate-900 dark:text-white uppercase">Suporte Técnico</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Central de Ajuda</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>

          <button 
            onClick={onLogout} 
            className="w-full p-6 bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Sair da Conta</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 text-sm">open_in_new</span>
          </button>
        </div>
      </main>

      {showCampusSelector && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCampusSelector(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#121214] rounded-t-[3rem] p-8 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border-t border-primary/20">
            <header className="flex items-center justify-between mb-8 px-2 shrink-0">
              <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Selecionar Campus</h3>
              <button onClick={() => setShowCampusSelector(false)} className="size-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10">
              {CAMPUS_LIST.map((c) => (
                <div 
                  key={c} 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, campus: c }));
                    setShowCampusSelector(false);
                  }} 
                  className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer ${formData.campus === c ? 'bg-primary/10 border-primary shadow-sm' : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5'}`}
                >
                  <span className={`text-sm font-bold uppercase tracking-tight ${formData.campus === c ? 'text-primary font-black' : 'text-slate-600 dark:text-zinc-400'}`}>{c}</span>
                  {formData.campus === c && <span className="material-symbols-outlined text-primary">check_circle</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
