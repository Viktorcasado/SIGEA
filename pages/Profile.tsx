
import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, handleSupabaseError } from '../supabaseClient';

interface ProfileProps {
  navigateTo: (page: string) => void;
  toggleRole: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (val: 'light' | 'dark' | 'system') => void;
  role: UserRole;
  profile: { id: string; name: string; photo: string; campus: string; email: string; user_type?: string } | null;
  onUpdate: (data: any) => Promise<{success: boolean, error?: string, localOnly?: boolean}>;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

const USER_TYPES = ['ALUNO', 'SERVIDOR', 'PROFESSOR', 'COMUNIDADE EXTERNA', 'PALESTRANTE', 'VISITANTE'];

const Profile: React.FC<ProfileProps> = ({ 
  navigateTo, toggleRole, theme, setTheme, role, profile, onUpdate, onLogout, onDeleteAccount 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCampusSelector, setShowCampusSelector] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    photo: '', 
    campus: CAMPUS_LIST[0],
    email: '',
    user_type: 'ALUNO'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    if (profile) {
      setFormData({ 
        name: profile.name || '', 
        photo: profile.photo || '', 
        campus: profile.campus || CAMPUS_LIST[0],
        email: profile.email || '',
        user_type: profile.user_type || 'ALUNO'
      });
      
      const savedBio = localStorage.getItem(`sigea_bio_enabled_${profile.id}`);
      setBiometricEnabled(savedBio === 'true');
    }

    const checkSupport = async () => {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricSupported(available);
        } catch (e) {
          setBiometricSupported(false);
        }
      }
    };
    checkSupport();
  }, [profile]);

  const handleToggleBiometric = async () => {
    if (!biometricSupported || !profile) return;

    if (!biometricEnabled) {
      try {
        // O desafio (challenge) deve ser um ArrayBuffer
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        // O ID do usuário também deve ser um ArrayBuffer
        const userId = new TextEncoder().encode(profile.id);

        const createOptions: CredentialCreationOptions = {
          publicKey: {
            challenge: challenge,
            rp: { name: "SIGEA IFAL", id: window.location.hostname },
            user: {
              id: userId,
              name: profile.email,
              displayName: profile.name
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { 
              userVerification: "required",
              authenticatorAttachment: "platform",
              requireResidentKey: false
            },
            timeout: 60000
          }
        };

        // Correção de contexto: Chamando diretamente do objeto pai sem intermediários
        const credential = await window.navigator.credentials.create(createOptions);
        
        if (credential) {
          localStorage.setItem(`sigea_bio_enabled_${profile.id}`, 'true');
          setBiometricEnabled(true);
          if (window.navigator.vibrate) window.navigator.vibrate([20, 50]);
        }
      } catch (err: any) {
        console.error("Erro ao ativar biometria:", err);
        // Tratamento amigável para erro de permissão de frame/desenvolvimento
        if (err.name === 'SecurityError' || err.message.includes('feature is not enabled')) {
           setErrorModal({ 
            show: true, 
            msg: "A biometria foi bloqueada pelo navegador. Isso acontece quando o app está dentro de uma janela de testes. Tente acessar o app pelo domínio oficial diretamente." 
          });
        } else {
          setErrorModal({ 
            show: true, 
            msg: "Não foi possível vincular sua biometria. Verifique se o FaceID/Digital está configurado no seu celular." 
          });
        }
      }
    } else {
      localStorage.removeItem(`sigea_bio_enabled_${profile.id}`);
      setBiometricEnabled(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return setErrorModal({ show: true, msg: 'O nome institucional é obrigatório.' });
    setIsSaving(true);
    try {
      const result = await onUpdate({ 
        name: formData.name, 
        campus: formData.campus, 
        user_type: formData.user_type, 
        imageFile: selectedFile 
      });
      if (result.success) {
        setIsEditing(false);
        setSelectedFile(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setErrorModal({ show: true, msg: handleSupabaseError(err) });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in fade-in overflow-y-auto no-scrollbar">
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 border border-primary/20 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-zinc-900 dark:text-white text-xs font-black uppercase tracking-tight mb-8 leading-relaxed">{errorModal.msg}</p>
            <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-16 bg-primary text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95">Entendi</button>
          </div>
        </div>
      )}

      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-50 border-b border-zinc-100 dark:border-white/5">
        <button onClick={() => isEditing ? setIsEditing(false) : navigateTo('home')} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xl active:scale-90 transition-all"><span className="material-symbols-outlined font-black">{isEditing ? 'close' : 'arrow_back'}</span></button>
        <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500">{isEditing ? 'Ajustes' : 'Perfil'}</h2>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving} className={`size-12 flex items-center justify-center rounded-2xl transition-all shadow-2xl ${isEditing ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
          {isSaving ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined">{isEditing ? 'check' : 'edit'}</span>}
        </button>
      </header>

      <main className="px-6 flex flex-col items-center">
        <div className="relative mb-10 mt-6">
          <div onClick={() => isEditing && fileInputRef.current?.click()} className="size-36 rounded-[3rem] bg-primary/20 flex items-center justify-center text-primary text-5xl font-black ring-8 ring-white dark:ring-zinc-900 shadow-2xl overflow-hidden relative group">
            {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : formData.name[0]}
            {isEditing && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"><span className="material-symbols-outlined text-3xl">add_a_photo</span></div>}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              setSelectedFile(file);
              const r = new FileReader();
              r.onload = () => setFormData({...formData, photo: r.result as string});
              r.readAsDataURL(file);
            }
          }} />
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Nome Oficial</label>
            <input disabled={!isEditing} type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-18 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-3xl px-8 text-sm font-bold outline-none text-zinc-900 dark:text-white transition-all focus:ring-4 focus:ring-primary/10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div onClick={() => isEditing && setShowTypeSelector(true)} className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Vínculo</label>
                <div className={`w-full h-18 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-3xl px-6 flex items-center justify-between text-[10px] font-black uppercase text-zinc-900 dark:text-white ${isEditing ? 'cursor-pointer' : 'opacity-60'}`}>{formData.user_type} <span className="material-symbols-outlined text-primary text-sm">expand_more</span></div>
             </div>
             <div onClick={() => isEditing && setShowCampusSelector(true)} className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Unidade</label>
                <div className={`w-full h-18 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-3xl px-6 flex items-center justify-between text-[10px] font-black uppercase text-zinc-900 dark:text-white ${isEditing ? 'cursor-pointer' : 'opacity-60'}`}>Campus <span className="material-symbols-outlined text-primary text-sm">expand_more</span></div>
             </div>
          </div>

          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 shadow-xl space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-tight">Modo Organizador</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Gerenciar eventos</span>
                </div>
                <button 
                  onClick={toggleRole}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${role === UserRole.ORGANIZER ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-300 shadow-md ${role === UserRole.ORGANIZER ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             {biometricSupported && (
               <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-tight">FaceID / Digital</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Login rápido no dispositivo</span>
                  </div>
                  <button 
                    onClick={handleToggleBiometric}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${biometricEnabled ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-300 shadow-md ${biometricEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
               </div>
             )}
          </div>
        </div>

        <div className="w-full max-w-sm space-y-4 pt-12">
          <button onClick={onLogout} className="w-full p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-white/5 shadow-xl flex items-center justify-between group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center transition-colors group-hover:bg-red-500 group-hover:text-white"><span className="material-symbols-outlined">logout</span></div>
              <div className="text-left"><p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Sair do App</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Encerra sua sessão local</p></div>
            </div>
            <span className="material-symbols-outlined text-zinc-300">chevron_right</span>
          </button>
        </div>
      </main>

      {showCampusSelector && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCampusSelector(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#121214] rounded-t-[3rem] p-8 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <header className="flex items-center justify-between mb-8 px-2 shrink-0"><h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Selecionar Unidade</h3><button onClick={() => setShowCampusSelector(false)} className="size-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button></header>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10 px-2">
              {CAMPUS_LIST.map(c => (
                <div key={c} onClick={() => { setFormData({...formData, campus: c}); setShowCampusSelector(false); }} className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${formData.campus === c ? 'bg-primary/10 border-primary' : 'bg-slate-50 dark:bg-zinc-900 border-transparent'}`}>
                  <span className={`text-xs font-bold uppercase tracking-tight ${formData.campus === c ? 'text-primary font-black' : 'text-slate-600 dark:text-zinc-400'}`}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTypeSelector && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTypeSelector(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#121214] rounded-t-[3rem] p-8 max-h-[60vh] overflow-hidden flex flex-col shadow-2xl">
            <header className="flex items-center justify-between mb-8 px-2 shrink-0"><h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Classificação</h3><button onClick={() => setShowTypeSelector(false)} className="size-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button></header>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10 px-2">
              {USER_TYPES.map(t => (
                <div key={t} onClick={() => { setFormData({...formData, user_type: t}); setShowTypeSelector(false); }} className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${formData.user_type === t ? 'bg-primary/10 border-primary' : 'bg-slate-50 dark:bg-zinc-900 border-transparent'}`}>
                  <span className={`text-xs font-bold uppercase tracking-tight ${formData.user_type === t ? 'text-primary font-black' : 'text-slate-600 dark:text-zinc-400'}`}>{t}</span>
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
