
import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types.ts';
import { CAMPUS_LIST } from '../constants.tsx';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';

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
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string, type?: 'security' | 'error'}>({ show: false, msg: '' });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
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
  }, [profile]);

  const handleToggleBiometric = async () => {
    if (!profile) return;

    if (!biometricEnabled) {
      try {
        // Verifica se está rodando em frame (como AI Studio ou alguns APKs)
        const isIframe = window.self !== window.top;

        if (!window.isSecureContext) {
          throw new Error("A biometria requer HTTPS. Use o link da Vercel para ativar.");
        }

        if (!window.PublicKeyCredential) {
          throw new Error("Seu dispositivo ou navegador atual não suporta biometria web.");
        }

        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const userId = new TextEncoder().encode(profile.id);
        
        // Domínio oficial para o APK reconhecer a "Relying Party"
        const rpId = window.location.hostname === 'localhost' || !window.location.hostname 
          ? 'sigea-ifal.vercel.app' 
          : window.location.hostname;

        const createOptions: CredentialCreationOptions = {
          publicKey: {
            challenge,
            rp: { name: "SIGEA IFAL", id: rpId },
            user: {
              id: userId,
              name: profile.email,
              displayName: profile.name
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { 
              userVerification: "required",
              authenticatorAttachment: "platform"
            },
            timeout: 60000
          }
        };

        const credential = await window.navigator.credentials.create(createOptions);
        
        if (credential) {
          localStorage.setItem(`sigea_bio_enabled_${profile.id}`, 'true');
          setBiometricEnabled(true);
        }
      } catch (err: any) {
        let userMsg = "Erro na biometria.";
        let type: 'security' | 'error' = 'error';
        
        if (err.name === 'SecurityError') {
          type = 'security';
          userMsg = "BIOMETRIA BLOQUEADA: Este ambiente (Prévia ou APK) restringe o acesso ao sensor. Use o link direto da Vercel ou configure o APK com permissão de credenciais.";
        } else if (err.name === 'NotAllowedError') {
          userMsg = "Acesso negado ou cancelado.";
        } else {
          userMsg = err.message || "Não foi possível ativar a biometria.";
        }

        setErrorModal({ show: true, msg: userMsg, type });
      }
    } else {
      localStorage.removeItem(`sigea_bio_enabled_${profile.id}`);
      setBiometricEnabled(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return setErrorModal({ show: true, msg: 'Nome é obrigatório.' });
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 border border-primary/20 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl animate-in zoom-in duration-300">
            <div className={`size-16 rounded-full mx-auto mb-6 flex items-center justify-center ${errorModal.type === 'security' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>
               <span className="material-symbols-outlined text-3xl">{errorModal.type === 'security' ? 'shield_lock' : 'fingerprint'}</span>
            </div>
            <p className="text-zinc-900 dark:text-white text-[11px] font-black uppercase tracking-tight mb-8 leading-relaxed">{errorModal.msg}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setErrorModal({show:false, msg:''})} className="w-full h-14 bg-primary text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95">Fechar</button>
              {errorModal.type === 'security' && (
                <button onClick={() => window.open('https://sigea-ifal.vercel.app', '_blank')} className="w-full h-14 bg-zinc-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95">Abrir Link Direto</button>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-50 border-b border-zinc-100 dark:border-white/5">
        <button onClick={() => isEditing ? setIsEditing(false) : navigateTo('home')} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xl active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black">{isEditing ? 'close' : 'arrow_back'}</span>
        </button>
        <div className="flex flex-col items-center text-center">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500">{isEditing ? 'Ajustes' : 'Perfil'}</h2>
            <span className="text-[8px] font-black text-primary uppercase tracking-widest">Institucional</span>
        </div>
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

          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 shadow-xl space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-tight">Modo Organizador</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Gerenciar eventos</span>
                </div>
                <button onClick={toggleRole} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${role === UserRole.ORGANIZER ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                  <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-300 shadow-md ${role === UserRole.ORGANIZER ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-tight">Biometria (Digital)</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Segurança no Dispositivo</span>
                </div>
                <button onClick={handleToggleBiometric} className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${biometricEnabled ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                  <div className={`absolute top-1 size-6 bg-white rounded-full transition-all duration-300 shadow-md ${biometricEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
          </div>
        </div>

        <button onClick={onLogout} className="mt-12 w-full max-w-sm p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-white/5 shadow-xl flex items-center justify-between group active:scale-95 transition-all">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center"><span className="material-symbols-outlined">logout</span></div>
            <div className="text-left"><p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Sair</p></div>
          </div>
          <span className="material-symbols-outlined text-zinc-300">chevron_right</span>
        </button>
      </main>
    </div>
  );
};

export default Profile;
