
import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { CAMPUS_LIST } from '../constants';

interface ProfileProps {
  navigateTo: (page: string) => void;
  toggleRole: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  role: UserRole;
  profile: { name: string; photo: string; campus: string; email: string };
  onUpdate: (profile: any, file?: File) => Promise<void>;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ navigateTo, toggleRole, darkMode, setDarkMode, role, profile, onUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(profile);
    setHasChanges(changed);
  }, [formData, profile]);

  const handleSave = async () => {
    setIsUploading(true);
    await onUpdate(formData, fileInputRef.current?.files?.[0]);
    setIsUploading(false);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md p-4 border-b-2 border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
        <button onClick={() => isEditing ? setIsEditing(false) : navigateTo('home')} className="size-11 flex items-center justify-center rounded-full">
          <span className="material-symbols-outlined font-bold">{isEditing ? 'close' : 'arrow_back'}</span>
        </button>
        <h2 className="text-xs font-black uppercase tracking-widest">{isEditing ? 'Editar Perfil' : 'Meu Perfil'}</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="size-11 text-primary">
            <span className="material-symbols-outlined font-bold">edit</span>
          </button>
        )}
      </header>

      <main className="flex flex-col items-center px-6 pt-10 space-y-10">
        <div
          className="size-32 rounded-full border-4 border-white shadow-xl bg-cover bg-center relative group overflow-hidden"
          style={{ backgroundImage: `url("${formData.photo}")` }}
        >
          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-4xl">add_a_photo</span>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="w-full space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">Nome</span>
              {isEditing ? (
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-200 rounded-2xl outline-none font-bold text-sm" />
              ) : (
                <p className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl font-black">{profile.name}</p>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">E-mail</span>
              {isEditing ? (
                <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-200 rounded-2xl outline-none font-bold text-sm" />
              ) : (
                <p className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl font-bold opacity-70">{profile.email}</p>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="pt-4 space-y-4">
              <div className="p-1 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 flex relative">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`flex-1 py-4 rounded-[1.2rem] flex items-center justify-center gap-2 transition-all duration-300 ${!darkMode ? 'bg-white shadow-lg shadow-slate-200/50 text-slate-900 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className={`material-symbols-outlined ${!darkMode ? 'filled text-orange-500' : ''}`}>light_mode</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Claro</span>
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`flex-1 py-4 rounded-[1.2rem] flex items-center justify-center gap-2 transition-all duration-300 ${darkMode ? 'bg-slate-800 shadow-lg shadow-black/20 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className={`material-symbols-outlined ${darkMode ? 'filled text-blue-400' : ''}`}>dark_mode</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Escuro</span>
                </button>
              </div>
              <button onClick={toggleRole} className="w-full p-5 flex items-center justify-between bg-white dark:bg-slate-800 rounded-3xl border-2 border-primary/20">
                <span className="text-sm font-black uppercase">Mudar para {role === UserRole.PARTICIPANT ? 'Organizador' : 'Participante'}</span>
                <span className="material-symbols-outlined">swap_horiz</span>
              </button>

              <button
                onClick={() => navigateTo('contacts')}
                className="w-full p-5 flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 rounded-3xl border-2 border-blue-100 dark:border-blue-900/30 active:scale-95 transition-all"
              >
                <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-300">Contatos e Suporte</span>
                <span className="material-symbols-outlined text-primary">support_agent</span>
              </button>

              <button
                onClick={() => navigateTo('privacy')}
                className="w-full p-5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 active:scale-95 transition-all"
              >
                <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-300">Políticas e Privacidade</span>
                <span className="material-symbols-outlined text-slate-400">verified_user</span>
              </button>

              <button onClick={onLogout} className="w-full py-5 text-red-600 font-black text-[11px] uppercase tracking-widest border-2 border-transparent hover:bg-red-50 rounded-3xl">
                Sair da Conta
              </button>
            </div>
          )}
        </div>
      </main>

      {isEditing && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="w-full py-5 bg-primary text-white font-black rounded-3xl uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Salvar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
