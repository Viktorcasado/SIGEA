
import React from 'react';
import Logo from './Logo.tsx';
import { UserRole } from '../types.ts';

interface SidebarProps {
  currentPage: string;
  navigateTo: (page: string) => void;
  role: UserRole;
  profile: any;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, role, profile, onLogout }) => {
  const menuItems = [
    { id: 'home', label: role === UserRole.ORGANIZER ? 'Dashboard' : 'Início', icon: 'dashboard' },
    { id: 'events', label: 'Explorar Eventos', icon: 'explore' },
    { id: 'certificates', label: 'Meus Títulos', icon: 'workspace_premium' },
  ];

  const adminItems = role === UserRole.ORGANIZER ? [
    { id: 'create-event', label: 'Criar Evento', icon: 'add_circle' },
    { id: 'check-in', label: 'Painel Check-in', icon: 'qr_code_scanner' },
  ] : [];

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white dark:bg-[#0b0b0d] border-r border-slate-200 dark:border-white/5 p-8 z-50">
      <div className="mb-12 px-2">
        <Logo size="md" />
        <div className="flex items-center gap-2 mt-2">
           <div className="size-1.5 bg-primary rounded-full animate-pulse"></div>
           <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em]">Portal Acadêmico</p>
        </div>
      </div>

      <nav className="flex-1 space-y-8">
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Principal</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group active:scale-95 ${
                currentPage === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${currentPage === item.id ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        {adminItems.length > 0 && (
          <div className="space-y-2">
            <p className="px-4 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Gestão do Campus</p>
            {adminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group active:scale-95 ${
                  currentPage === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${currentPage === item.id ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/5 space-y-6">
        <button 
          onClick={() => navigateTo('profile')}
          className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
        >
          <div className="size-11 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs overflow-hidden shadow-lg shadow-primary/20 border-2 border-white dark:border-zinc-800">
            {profile?.photo ? (
              <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              profile?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="text-left min-w-0">
            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate">{profile?.name || 'Usuário'}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase truncate tracking-widest">Ver Perfil</p>
          </div>
          <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-primary transition-colors">settings</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all group active:scale-95"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="text-xs font-black uppercase tracking-widest">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
