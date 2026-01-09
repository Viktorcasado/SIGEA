
import React, { useState, useEffect } from 'react';
import Logo from './Logo.tsx';
import { UserRole } from '../types.ts';

// NavButton component defined outside Sidebar to fix TypeScript key error and follow React best practices
interface NavButtonProps {
  item: any;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ item, isActive, isCollapsed, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? item.label : ''}
      className={`w-full flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 group relative active:scale-[0.97] ${
        isCollapsed ? 'justify-center px-0' : 'px-4'
      } ${
        isActive 
        ? 'bg-primary/10 text-primary' 
        : 'text-slate-500 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
    >
      <span 
        className={`material-symbols-outlined text-[24px] transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
        style={{ 
          fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 300",
        }}
      >
        {item.icon}
      </span>
      
      {!isCollapsed && (
        <span className={`text-[11px] font-black uppercase tracking-[0.15em] truncate animate-in slide-in-from-left-2 duration-500 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
          {item.label}
        </span>
      )}

      {isActive && (
        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_#10b981]"></div>
      )}
    </button>
  );
};

interface SidebarProps {
  currentPage: string;
  navigateTo: (page: string) => void;
  role: UserRole;
  profile: any;
  onLogout: () => void;
  openPortal: (url: string, name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, role, profile, onLogout, openPortal }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sigea_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sigea_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { id: 'home', label: role === UserRole.ORGANIZER ? 'Painel' : 'Início', icon: 'home' },
    { id: 'events', label: 'Explorar Eventos', icon: 'explore' },
    { id: 'certificates', label: 'Meus Títulos', icon: 'military_tech' },
  ];

  const adminItems = role === UserRole.ORGANIZER ? [
    { id: 'create-event', label: 'Criar Evento', icon: 'add_circle' },
    { id: 'check-in', label: 'Painel Check-in', icon: 'qr_code_2' },
    { id: 'reports', label: 'Relatórios', icon: 'monitoring' },
  ] : [];

  const utilityItems = [
    { id: 'integrations', label: 'Integrações', icon: 'sync' },
    { id: 'help', label: 'Central de Ajuda', icon: 'help' },
  ];

  const quickPortals = [
    { name: 'SUAP', url: 'https://suap.ifal.edu.br', icon: 'account_balance' },
    { name: 'SIGAA', url: 'https://sigaa.ifal.edu.br', icon: 'school' },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-[#0b0b0d] border-r border-slate-200 dark:border-white/5 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
        isCollapsed ? 'w-20 px-3' : 'w-72 px-8'
      }`}
    >
      {/* Botão de Toggle - Estilo Windows Minimalista */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-12 size-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all z-[100] group active:scale-90"
        title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
      >
        <span className="material-symbols-outlined text-[18px] transition-transform duration-500" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', fontVariationSettings: "'wght' 600" }}>
          chevron_left
        </span>
      </button>

      <div className={`mb-10 mt-10 transition-all duration-500 ${isCollapsed ? 'px-0 flex justify-center scale-90' : 'px-2'}`}>
        <Logo size={isCollapsed ? 'sm' : 'md'} />
      </div>

      <nav className="flex-1 space-y-10 overflow-y-auto no-scrollbar pt-2">
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 animate-in fade-in duration-700">Geral</p>
          )}
          {menuItems.map((item) => (
            <NavButton 
              key={item.id} 
              item={item} 
              isActive={currentPage === item.id} 
              isCollapsed={isCollapsed} 
              onClick={() => navigateTo(item.id)} 
            />
          ))}
        </div>

        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 animate-in fade-in duration-700">Acesso Rápido</p>
          )}
          {quickPortals.map((portal) => (
            <button
              key={portal.name}
              onClick={() => openPortal(portal.url, portal.name)}
              className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl transition-all duration-300 text-slate-500 dark:text-zinc-500 hover:bg-primary/5 hover:text-primary ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <span className="material-symbols-outlined text-[24px]">{portal.icon}</span>
              {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-[0.15em]">{portal.name}</span>}
            </button>
          ))}
        </div>

        {adminItems.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-4 text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 animate-in fade-in duration-700">Administração</p>
            )}
            {adminItems.map((item) => (
              <NavButton 
                key={item.id} 
                item={item} 
                isActive={currentPage === item.id} 
                isCollapsed={isCollapsed} 
                onClick={() => navigateTo(item.id)} 
              />
            ))}
          </div>
        )}

        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 animate-in fade-in duration-700">Ecossistema IFAL</p>
          )}
          {utilityItems.map((item) => (
            <NavButton 
              key={item.id} 
              item={item} 
              isActive={currentPage === item.id} 
              isCollapsed={isCollapsed} 
              onClick={() => navigateTo(item.id)} 
            />
          ))}
        </div>
      </nav>

      <div className={`mt-auto py-8 border-t border-slate-100 dark:border-white/5 space-y-4 transition-all duration-500 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <button 
          onClick={() => navigateTo('profile')}
          title={isCollapsed ? 'Minha Conta' : ''}
          className={`w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs overflow-hidden shadow-lg shadow-primary/20 border-2 border-white dark:border-zinc-800 shrink-0 group-hover:scale-105 transition-transform">
            {profile?.photo ? (
              <img src={profile.photo} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <span style={{ fontVariationSettings: "'wght' 800" }}>{profile?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="text-left min-w-0 flex-1 animate-in fade-in duration-700">
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{profile?.name || 'Usuário'}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Configurações</p>
            </div>
          )}
        </button>

        <button 
          onClick={onLogout}
          title={isCollapsed ? 'Sair' : ''}
          className={`w-full flex items-center gap-4 h-12 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all group active:scale-95 border border-transparent ${
            isCollapsed ? 'justify-center px-0' : 'px-4'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'wght' 300" }}>
            logout
          </span>
          {!isCollapsed && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in duration-700">Deslogar</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
