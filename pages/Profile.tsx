
import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { CAMPUS_LIST } from '../constants';

interface ProfileProps {
  navigateTo: (page: string) => void;
  toggleRole: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (val: 'light' | 'dark' | 'system') => void;
  role: UserRole;
  profile: { id: string; name: string; photo: string; campus: string; email: string };
  onUpdate: (profile: any) => Promise<void> | void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ 
  navigateTo, toggleRole, theme, setTheme, role, profile, onUpdate, onLogout, onDeleteAccount 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({ 
        name: formData.name, 
        campus: formData.campus,
        email: formData.email,
        photo: formData.photo
      });
      setIsEditing(false);
    } catch (error) { 
      alert("Erro ao salvar perfil.");
    } finally { 
      setIsSaving(false); 
    }
  };

  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US';

  const themeOptions = [
    { value: 'light', icon: 'light_mode', label: 'Claro' },
    { value: 'dark', icon: 'dark_mode', label: 'Escuro' },
    { value: 'system', icon: 'settings_brightness', label: 'Auto' }
  ] as const;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-50 transition-colors border-b border-transparent dark:border-white/5">
        <button 
          onClick={() => isEditing ? setIsEditing(false) : navigateTo('home')} 
          className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-xl text-slate-900 dark:text-white transition-all active:scale-90 border border-slate-100 dark:border-white/5"
        >
          <span className="material-symbols-outlined font-black text-2xl">{isEditing ? 'close' : 'arrow_back'}</span>
        </button>
        <h2 className="text-[12px] font-[900] uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500">
          {isEditing ? 'Configurações' : 'Perfil Acadêmico'}
        </h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`size-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 shadow-2xl ${isEditing ? 'bg-primary text-white shadow-primary/30' : 'bg-primary/10 text-primary border border-primary/20'}`}
        >
          {isSaving ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined font-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{isEditing ? 'check' : 'edit_square'}</span>
          )}
        </button>
      </header>

      <main className="px-6 flex flex-col items-center">
        <div className="flex flex-col items-center mb-12 w-full pt-6">
          <div className="relative mb-8">
            <div 
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={`size-40 rounded-[3rem] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-6xl font-[900] tracking-tighter ring-[12px] ring-white dark:ring-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-500 ${isEditing ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
            >
               {formData.photo ? (
                 <img src={formData.photo} className="w-full h-full object-cover" alt="Profile" />
               ) : (
                 initials
               )}
               {isEditing && (
                 <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
                 </div>
               )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            {!isEditing && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl px-6 py-2.5 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-white/5 flex items-center gap-2">
                <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">{role}</span>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 max-w-sm">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-4">Nome completo no SIGEA</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white shadow-sm"
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-4">Unidade IFAL</label>
                <select 
                  value={formData.campus}
                  onChange={e => setFormData({...formData, campus: e.target.value})}
                  className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white appearance-none shadow-sm"
                >
                  {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 animate-in fade-in duration-700">
              <h1 className="text-3xl font-[900] text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                {profile.name || 'Participante'}
              </h1>
              <p className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{profile.email || 'portal@ifal.edu.br'}</p>
              <div className="mt-6 flex items-center justify-center gap-3 px-6 py-3 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl rounded-full border border-slate-100 dark:border-white/5 shadow-xl ring-1 ring-black/5">
                <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest">{profile.campus || 'Campus Maceió'}</span>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="w-full max-w-sm space-y-10 animate-in slide-in-from-bottom-8">
            
            <section className="space-y-5">
              <h3 className="text-[11px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">palette</span>
                Preferências
              </h3>
              <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 shadow-2xl border border-white/50 dark:border-white/5 ring-1 ring-black/5">
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-[900] text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">Tema Visual</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Controle o brilho do app</p>
                    </div>
                  </div>
                  
                  <div className="flex p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-[2rem] gap-2 border border-slate-100 dark:border-white/5">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-500 ${
                          theme === opt.value 
                          ? 'bg-white dark:bg-zinc-900 text-primary shadow-xl ring-1 ring-black/5' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: theme === opt.value ? "'FILL' 1" : "'FILL' 0" }}>{opt.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <h3 className="text-[11px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">verified_user</span>
                 Conta SIGEA
              </h3>
              <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-3 shadow-2xl border border-white/50 dark:border-white/5 ring-1 ring-black/5 space-y-2">
                <div onClick={toggleRole} className="flex items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
                      </div>
                      <div>
                          <p className="text-[14px] font-[900] text-slate-900 dark:text-white uppercase tracking-tight mb-1">Tipo de Acesso</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Alterar para {role === UserRole.PARTICIPANT ? 'Organizador' : 'Participante'}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-zinc-700">chevron_right</span>
                </div>

                <button onClick={onLogout} className="w-full flex items-center gap-5 p-6 rounded-[2rem] hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left group">
                    <div className="size-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-3xl">power_settings_new</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-[900] text-slate-900 dark:text-white uppercase tracking-tight mb-1 group-hover:text-red-500 transition-colors">Encerrar Sessão</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Sair deste portal</p>
                    </div>
                </button>
              </div>
            </section>

            <button onClick={onDeleteAccount} className="w-full flex items-center gap-5 p-7 rounded-[3rem] bg-red-500/5 hover:bg-red-500/10 transition-all text-left border border-red-500/10 backdrop-blur-md group">
                <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:rotate-12 transition-transform shadow-lg shadow-red-500/10">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete_sweep</span>
                </div>
                <div>
                    <p className="text-[14px] font-[900] text-red-600 uppercase tracking-tight mb-1">Excluir Registro</p>
                    <p className="text-[10px] font-bold text-red-900/40 uppercase tracking-widest">Apagar meus dados permanentes</p>
                </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
