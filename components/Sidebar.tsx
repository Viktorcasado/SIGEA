
import React, { useState } from 'react';
import Logo from './Logo.tsx';
import { UserRole } from '../types.ts';

/// Desenvolvido por Viktor Casado /// Projeto SIGEA – IFAL

interface SidebarProps {
  currentPage: string;
  navigateTo: (page: string, id?: string | null) => void;
  role: UserRole;
  profile: any;
  onLogout: () => void;
  openPortal: (url: string, name: string) => void;
  isOpenMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  selectedEventId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, navigateTo, role, profile, onLogout, isOpenMobile, setOpenMobile, selectedEventId 
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sigea_sidebar_collapsed') === 'true';
  });

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: 'dashboard', role: 'BOTH' },
    { id: 'events', label: 'Explorar', icon: 'explore', role: 'PARTICIPANT' },
    { id: 'certificates', label: 'Certificados', icon: 'military_tech', role: 'BOTH' },
    { id: 'profile', label: 'Ajustes', icon: 'settings', role: 'BOTH' },
  ];

  const handleNav = (id: string) => {
    navigateTo(id);
    setOpenMobile(false);
  };

  return (
    <>
      {isOpenMobile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] lg:hidden animate-in fade-in" onClick={() => setOpenMobile(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[102] lg:sticky lg:flex flex-col h-screen 
        bg-[#09090b] border-r border-white/5 transition-all duration-500 
        ${isOpenMobile ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-24' : 'lg:w-[280px]'}
      `}>
        <div className={`px-8 pt-12 pb-10 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <Logo size="md" />}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2.5 rounded-xl bg-white/5 text-zinc-500 hover:text-white transition-all">
            <span className="material-symbols-outlined text-2xl">{isCollapsed ? 'menu' : 'menu_open'}</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                currentPage === item.id 
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: currentPage === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              {!isCollapsed && <span className="text-[11px] font-[900] uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={onLogout} className={`w-full flex items-center gap-4 p-5 rounded-2xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
            <span className="material-symbols-outlined text-[24px]">logout</span>
            {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;