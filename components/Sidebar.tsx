
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
    { id: 'home', label: role === UserRole.ORGANIZER ? 'Dashboard' : 'Início', icon: 'grid_view' },
    { id: 'events', label: 'Explorar Eventos', icon: 'explore' },
    { id: 'certificates', label: 'Meus Títulos', icon: 'workspace_premium' },
  ];

  const adminItems = role === UserRole.ORGANIZER ? [
    { id: 'create-event', label: 'Criar Evento', icon: 'add_box' },
    { id: 'check-in', label: 'Painel Check-in', icon: 'qr_code_scanner' },
    { id: 'reports', label: 'Relatórios', icon: 'analytics' },
  ] : [];

  const utilityItems = [
    { id: 'help', label: 'Central de Ajuda', icon: 'help_outline' },
  ];

  // Fixed NavButton prop type to include 'key' for mapped elements
  const NavButton = ({ item }: { item: any; key?: string | number }) => {
    const isActive = currentPage === item.id;
    return (
      <button
        onClick={() => navigateTo(item.id)}
        title={isCollapsed ? item.label : ''}
        className={`w-full flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 group relative active:scale-95 ${
          isCollapsed ? 'justify-center px-0' : 'px-4'
        } ${
          isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-slate-500 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/5'
        }`}
      >
        <span 
          className={`material-symbols-outlined text-[24px] transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
          style={{ 
            fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
          }}
        >
          {item.icon}
        </span>
        
        {!isCollapsed && (
          <span className={`text-[11px] font-black uppercase tracking-widest truncate animate-in slide-in-from-left-2 duration-500 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
            {item.label}
          </span>
        )}

        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_12px_#10b981]"></div>
        )}
      </button>
    );
  };

  return (
    <aside 
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-[#0b0b0d] border-r border-slate-200 dark:border-white/5 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
        isCollapsed ? 'w-20 px-3' : 'w-72 px-8'
      }`}
    >
      {/* Botão de Toggle - Estilo Windows 11 Floating */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 size-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all z-[100] group active:scale-90"
      >
        <span className="material-symbols-outlined text-[18px] transition-transform duration-500" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          keyboard_double_arrow_left
        </span>
      </button>

      <div className={`mb-10 mt-10 transition-all duration-500 ${isCollapsed ? 'px-0 flex justify-center scale-90' : 'px-2'}`}>
        <Logo size={isCollapsed ? 'sm' : 'md'} />
      </div>

      <nav className="flex-1 space-y-10 overflow-y-auto no-scrollbar pt-2">
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 animate-in fade-in duration-700">Explorar</p>
          )}
          {menuItems.map((item) => <NavButton key={item.id} item={item} />)}
        </div>

        {adminItems.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-4 text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 animate-in fade-in duration-700">Gestão Acadêmica</p>
            )}
            {adminItems.map((item) => <NavButton key={item.id} item={item} />)}
          </div>
        )}

        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 animate-in fade-in duration-700">Recursos</p>
          )}
          {utilityItems.map((item) => <NavButton key={item.id} item={item} />)}
        </div>
      </nav>

      <div className={`mt-auto py-8 border-t border-slate-100 dark:border-white/5 space-y-4 transition-all duration-500 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <button 
          onClick={() => navigateTo('profile')}
          title={isCollapsed ? 'Configurações de Perfil' : ''}
          className={`w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs overflow-hidden shadow-lg shadow-primary/20 border-2 border-white dark:border-zinc-800 shrink-0 group-hover:scale-105 transition-transform">
            {profile?.photo ? (
              <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              profile?.name?.charAt(0) || 'U'
            )}
          </div>
          {!isCollapsed && (
            <div className="text-left min-w-0 flex-1 animate-in fade-in duration-700">
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{profile?.name || 'Usuário'}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ver Configurações</p>
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
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'wght' 400" }}>
            power_settings_new
          </span>
          {!isCollapsed && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in duration-700">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
