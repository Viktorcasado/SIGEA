
import React, { useState, useEffect } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sigea_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sigea_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { id: 'home', label: role === UserRole.ORGANIZER ? 'Dashboard' : 'Início', icon: 'dashboard' },
    { id: 'events', label: 'Explorar Eventos', icon: 'explore' },
    { id: 'certificates', label: 'Meus Títulos', icon: 'workspace_premium' },
  ];

  const adminItems = role === UserRole.ORGANIZER ? [
    { id: 'create-event', label: 'Criar Evento', icon: 'add_circle' },
    { id: 'check-in', label: 'Painel Check-in', icon: 'qr_code_scanner' },
    { id: 'reports', label: 'Relatórios', icon: 'analytics' },
  ] : [];

  const utilityItems = [
    { id: 'help', label: 'Central de Ajuda', icon: 'help_center' },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-[#0b0b0d] border-r border-slate-200 dark:border-white/5 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-24 px-4' : 'w-72 px-8'
      }`}
    >
      {/* Botão de Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 size-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all z-50 border-2 border-white dark:border-[#0b0b0d]"
      >
        <span className="material-symbols-outlined text-[16px] font-black">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      <div className={`mb-12 mt-8 transition-all duration-300 ${isCollapsed ? 'px-0 flex justify-center' : 'px-2'}`}>
        <Logo size={isCollapsed ? 'sm' : 'md'} />
        {!isCollapsed && (
          <div className="flex items-center gap-2 mt-2 animate-in fade-in duration-500">
             <div className="size-1.5 bg-primary rounded-full animate-pulse"></div>
             <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em]">Portal Acadêmico</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          {!isCollapsed && (
            <p className="px-4 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-4 animate-in fade-in">Principal</p>
          )}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center gap-4 py-4 rounded-2xl transition-all group active:scale-95 ${
                isCollapsed ? 'justify-center px-0' : 'px-4'
              } ${
                currentPage === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20 font-black' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${currentPage === item.id ? 'filled' : ''}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-[11px] uppercase tracking-wide truncate animate-in slide-in-from-left-2">{item.label}</span>
              )}
            </button>
          ))}
        </div>

        {adminItems.length > 0 && (
          <div className="space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-4 animate-in fade-in">Gestão</p>
            )}
            {adminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-4 py-4 rounded-2xl transition-all group active:scale-95 ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  currentPage === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 font-black' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 font-bold'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${currentPage === item.id ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-[11px] uppercase tracking-wide truncate animate-in slide-in-from-left-2">{item.label}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {!isCollapsed && (
            <p className="px-4 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-4 animate-in fade-in">Suporte</p>
          )}
          {utilityItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center gap-4 py-4 rounded-2xl transition-all group active:scale-95 ${
                isCollapsed ? 'justify-center px-0' : 'px-4'
              } ${
                currentPage === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20 font-black' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 font-bold'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${currentPage === item.id ? 'filled' : ''}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-[11px] uppercase tracking-wide truncate animate-in slide-in-from-left-2">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className={`mt-auto py-8 border-t border-slate-100 dark:border-white/5 space-y-4 transition-all ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <button 
          onClick={() => navigateTo('profile')}
          title={isCollapsed ? 'Configurações de Perfil' : ''}
          className={`w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs overflow-hidden shadow-lg shadow-primary/20 border-2 border-white dark:border-zinc-800 shrink-0">
            {profile?.photo ? (
              <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              profile?.name?.charAt(0) || 'U'
            )}
          </div>
          {!isCollapsed && (
            <div className="text-left min-w-0 flex-1 animate-in fade-in">
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{profile?.name || 'Usuário'}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Acessar Perfil</p>
            </div>
          )}
        </button>

        <button 
          onClick={onLogout}
          title={isCollapsed ? 'Encerrar Sessão' : ''}
          className={`w-full flex items-center gap-4 h-12 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all group active:scale-95 border border-transparent ${
            isCollapsed ? 'justify-center px-0' : 'px-4'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          {!isCollapsed && (
            <span className="text-[10px] font-black uppercase tracking-widest animate-in fade-in">Sair</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
