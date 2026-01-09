
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
  onUpdate: (profile: any) => Promise<boolean> | void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ 
  navigateTo, toggleRole, theme, setTheme, role, profile, onUpdate, onLogout, onDeleteAccount 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCampusSelector, setShowCampusSelector] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: profile?.name || '', 
    photo: profile?.photo || '', 
    campus: profile?.campus || CAMPUS_LIST[0],
    email: profile?.email || ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    if (profile && !isEditing) {
      setFormData({ 
        name: profile.name, 
        photo: profile.photo, 
        campus: profile.campus || CAMPUS_LIST[0],
        email: profile.email
      }); 
    }
  }, [profile, isEditing]);

  if (!profile) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
      // Enviamos tanto photo quanto photo_url para garantir compatibilidade com o metadata
      const success = await onUpdate({ 
        name: formData.name, 
        campus: formData.campus, 
        photo_url: formData.photo,
        photo: formData.photo
      });
      
      if (success) {
        setSaveSuccess(true);
        setIsEditing(false);
        if (window.navigator.vibrate) window.navigator.vibrate([10, 30, 10]);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) { 
      console.error("Erro ao salvar perfil:", error);
    } finally { 
      setIsSaving(false); 
    }
  };

  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US';

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      
      {saveSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-4">
          Perfil Atualizado com Sucesso!
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl scale-up-center">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">delete_forever</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Excluir Sua Conta?</h3>
            <p className="text-[11px] font-bold text-zinc-400 uppercase leading-relaxed tracking-widest mb-8">
              Esta ação removerá todos os seus dados de inscrição e acesso ao portal. É irreversível.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={async () => {
                   setIsDeleting(true);
                   await onDeleteAccount();
                   setIsDeleting(false);
                   setShowDeleteModal(false);
                }}
                disabled={isDeleting}
                className="w-full h-16 bg-red-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                {isDeleting ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Confirmar Exclusão"}
              </button>
              <button 
                onClick={() => !isDeleting && setShowDeleteModal(false)}
                className="w-full h-16 bg-zinc-800 text-zinc-400 font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-50 border-b border-transparent dark:border-white/5">
        <button 
          onClick={() => isEditing ? setIsEditing(false) : navigateTo('home')} 
          className="size-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white shadow-xl shadow-black/5 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px] font-black">
            {isEditing ? 'close' : 'arrow_back_ios_new'}
          </span>
        </button>
        <h2 className="text-[12px] font-[900] uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500">{isEditing ? 'Configurações' : 'Perfil SIGEA'}</h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
          disabled={isSaving} 
          className={`size-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 shadow-2xl ${isEditing ? 'bg-primary text-white shadow-primary/30' : 'bg-primary/10 text-primary border border-primary/20'}`}
        >
          {isSaving ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isEditing ? 'check' : 'edit_square'}
            </span>
          )}
        </button>
      </header>

      <main className="px-6 flex flex-col items-center">
        <div className="w-full max-sm mb-10 p-2 bg-slate-200/50 dark:bg-zinc-900/50 rounded-[2rem] border border-white/5 shadow-inner">
           <div className="flex p-1 gap-1">
              <button 
                onClick={() => role === UserRole.ORGANIZER && toggleRole()}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.PARTICIPANT ? 'bg-white dark:bg-zinc-800 text-primary shadow-xl' : 'text-slate-400'}`}
              >
                <span className="material-symbols-outlined text-lg">person</span> Participante
              </button>
              <button 
                onClick={() => role === UserRole.PARTICIPANT && toggleRole()}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${role === UserRole.ORGANIZER ? 'bg-white dark:bg-zinc-800 text-primary shadow-xl' : 'text-slate-400'}`}
              >
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Organizador
              </button>
           </div>
        </div>

        <div className="flex flex-col items-center mb-12 w-full pt-2">
          <div className="relative mb-8">
            <div onClick={() => isEditing && fileInputRef.current?.click()} className={`size-40 rounded-[3.5rem] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-6xl font-[900] tracking-tighter ring-[12px] ring-white dark:ring-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-500 ${isEditing ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}>
               {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" alt="Profile" /> : initials}
               {isEditing && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"><span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span></div>}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 max-w-sm">
              <div className="space-y-1.5 px-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} 
                  className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl text-sm font-bold outline-none text-slate-900 dark:text-white focus:border-primary/50 transition-all" 
                />
              </div>
              <div className="space-y-1.5 px-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Campus Oficial</label>
                <div 
                  onClick={() => setShowCampusSelector(true)} 
                  className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl text-sm font-bold flex items-center justify-between cursor-pointer text-slate-900 dark:text-white shadow-sm hover:border-primary transition-all"
                >
                  <span className="truncate">{formData.campus || "Selecionar Campus"}</span>
                  <span className="material-symbols-outlined text-primary">expand_more</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 animate-in fade-in duration-700 w-full max-w-sm">
              <h1 className="text-3xl font-[900] text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">{profile.name}</h1>
              <p className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{profile.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mt-2">
                 <span className="material-symbols-outlined text-primary text-sm">school</span>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">{profile.campus}</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm space-y-4 pt-10 pb-10">
          <button onClick={() => navigateTo('help')} className="w-full p-8 bg-white dark:bg-zinc-900/40 rounded-[3rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group active:scale-95 transition-all shadow-xl">
            <div className="flex items-center gap-5">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">contact_support</span>
              </div>
              <div className="text-left">
                <p className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Suporte Técnico</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Ajuda e LGPD</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>

          <button 
            onClick={onLogout} 
            disabled={isLoggingOut}
            className="w-full p-6 bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex items-center justify-between active:scale-95 transition-all disabled:opacity-50 group"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <div className="text-left"><p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Sair da Conta</p><p className="text-[9px] font-bold text-slate-400 dark:text-zinc-600 uppercase">Encerrar sessão atual</p></div>
            </div>
            <span className="material-symbols-outlined text-slate-300">logout</span>
          </button>

          <div className="pt-8 border-t border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-6 bg-red-500/5 hover:bg-red-500/10 rounded-[2.5rem] border border-red-500/10 flex items-center justify-between active:scale-95 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">person_remove</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-red-500 uppercase tracking-tight">Excluir Conta</p>
                  <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest">Zona de Perigo</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-red-500/30">warning</span>
            </button>
          </div>
        </div>
      </main>

      {showCampusSelector && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCampusSelector(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#121214] rounded-t-[3rem] p-8 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-t border-primary/20">
            <header className="flex items-center justify-between mb-8 px-2 shrink-0">
              <div className="flex flex-col">
                <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Campus Institucional</h3>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Selecione sua unidade oficial</p>
              </div>
              <button 
                onClick={() => setShowCampusSelector(false)} 
                className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined">check</span>
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-20 px-2">
              {CAMPUS_LIST.map((c) => {
                const isSelected = formData.campus === c;
                return (
                  <div 
                    key={c} 
                    onClick={() => {
                      if (window.navigator.vibrate) window.navigator.vibrate(5);
                      setFormData(prev => ({ ...prev, campus: c }));
                      setShowCampusSelector(false);
                    }} 
                    className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer ${isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 hover:border-slate-200'}`}
                  >
                    <span className={`text-sm font-bold uppercase tracking-tight ${isSelected ? 'text-primary font-black' : 'text-slate-600 dark:text-zinc-400'}`}>{c}</span>
                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 dark:border-zinc-700'}`}>
                      {isSelected && <div className="size-2 bg-white rounded-full"></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
