
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
    { value: 'system', icon: 'settings_brightness', label: 'Sistema' }
  ] as const;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 pb-32 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-xl z-50 transition-colors">
        <button 
          onClick={() => isEditing ? setIsEditing(false) : navigateTo('home')} 
          className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm text-slate-900 dark:text-white transition-all active:scale-90 border border-slate-100 dark:border-white/5"
        >
          <span className="material-symbols-outlined font-black">{isEditing ? 'close' : 'arrow_back'}</span>
        </button>
        <h2 className="text-[11px] font-[900] uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500">
          {isEditing ? 'Editando Perfil' : 'Meu Perfil'}
        </h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`size-11 flex items-center justify-center rounded-2xl transition-all active:scale-90 ${isEditing ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary'}`}
        >
          {isSaving ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined font-bold">{isEditing ? 'check' : 'edit'}</span>
          )}
        </button>
      </header>

      <main className="px-6 flex flex-col items-center">
        <div className="flex flex-col items-center mb-10 w-full">
          <div className="relative mb-6">
            <div 
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={`size-36 rounded-[2.5rem] bg-primary flex items-center justify-center text-white text-[56px] font-[900] tracking-tighter ring-8 ring-slate-50 dark:ring-zinc-900 shadow-2xl relative overflow-hidden transition-all ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
               {formData.photo ? (
                 <img src={formData.photo} className="w-full h-full object-cover" alt="Profile" />
               ) : (
                 initials
               )}
               {isEditing && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                 </div>
               )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            {!isEditing && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-2 rounded-full shadow-lg border-2 border-slate-50 dark:border-zinc-900">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{role}</span>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-4 animate-in slide-in-from-bottom-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-4">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest ml-4">Campus</label>
                <select 
                  value={formData.campus}
                  onChange={e => setFormData({...formData, campus: e.target.value})}
                  className="w-full h-14 px-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white appearance-none"
                >
                  {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2 animate-in fade-in">
              <h1 className="text-[28px] font-[900] text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                {profile.name || 'Usuário'}
              </h1>
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{profile.email || 'email@dominio.com'}</p>
              <div className="mt-4 flex items-center justify-center gap-2 px-5 py-2 bg-white dark:bg-zinc-900 rounded-full border border-slate-100 dark:border-white/5 shadow-sm">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                <span className="text-[9px] font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest">{profile.campus || 'Não Informado'}</span>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom-4">
            
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] ml-2">Preferências de Exibição</h3>
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-white/5">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-[900] text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">Aparência</p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Selecione o tema do app</p>
                    </div>
                  </div>
                  
                  <div className="flex p-1.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl gap-1">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                          theme === opt.value 
                          ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] ml-2">Conta e Acesso</h3>
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-3 shadow-xl border border-slate-100 dark:border-white/5 space-y-1">
                <div onClick={toggleRole} className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">account_circle</span>
                      </div>
                      <div>
                          <p className="text-[13px] font-[900] text-slate-900 dark:text-white uppercase tracking-tight">Tipo de Conta</p>
                          <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Mudar para {role === UserRole.PARTICIPANT ? 'Organizador' : 'Participante'}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-zinc-700">chevron_right</span>
                </div>

                <button onClick={onLogout} className="w-full flex items-center gap-5 p-6 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left">
                    <div className="size-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">logout</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-[900] text-slate-900 dark:text-white uppercase tracking-tight">Encerrar Sessão</p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Sair deste dispositivo</p>
                    </div>
                </button>
              </div>
            </section>

            <button onClick={onDeleteAccount} className="w-full flex items-center gap-5 p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900/50 hover:bg-red-500/10 transition-all text-left border border-slate-100 dark:border-white/5">
                <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <span className="material-symbols-outlined">delete_forever</span>
                </div>
                <div>
                    <p className="text-[13px] font-[900] text-red-500 uppercase tracking-tight">Excluir Tudo</p>
                    <p className="text-[9px] font-bold text-red-900/40 uppercase tracking-widest">Apagar conta do banco</p>
                </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
