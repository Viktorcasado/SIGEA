
import React, { useState, useEffect } from 'react';
import Logo from './Logo.tsx';
import { UserRole } from '../types.ts';

interface NavButtonProps {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  subItems?: { id: string; label: string }[];
}

const NavButton: React.FC<NavButtonProps> = ({ id, label, icon, isActive, isCollapsed, onClick, subItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => {
          if (subItems) setIsOpen(!isOpen);
          onClick();
        }}
        className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
          isCollapsed ? 'justify-center px-0' : 'px-3'
        } ${
          isActive 
          ? 'bg-primary/10 text-primary border-r-4 border-primary rounded-r-none' 
          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] transition-all duration-200">
          {icon}
        </span>
        
        {!isCollapsed && (
          <span className={`text-[13px] font-medium flex-1 text-left ${isActive ? 'font-bold' : ''}`}>
            {label}
          </span>
        )}

        {!isCollapsed && subItems && (
          <span className={`material-symbols-outlined text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        )}
      </button>

      {!isCollapsed && subItems && isOpen && (
        <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {subItems.map(sub => (
            <button 
              key={sub.id}
              className="w-full text-left py-2 px-3 text-[12px] font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
            >
              <div className="size-1 bg-slate-300 rounded-full"></div>
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
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

  const sections = [
    {
      title: "GESTÃO",
      items: [
        { id: 'home', label: 'Início', icon: 'home' },
        { id: 'participants', label: 'Pessoas', icon: 'person' },
      ]
    },
    {
      title: "PRÉ-EVENTO",
      items: [
        { id: 'registrations-list', label: 'Inscrições', icon: 'app_registration' },
        { id: 'events', label: 'Página do Evento', icon: 'description' },
        { id: 'schedule', label: 'Programação', icon: 'calendar_month' },
      ]
    },
    {
      title: "PÓS-EVENTO",
      items: [
        { id: 'certificates', label: 'Certificados', icon: 'workspace_premium' },
      ]
    },
    {
      title: "GERAL",
      items: [
        { 
          id: 'settings', 
          label: 'Configuração', 
          icon: 'settings',
          subItems: [
            { id: 'conf-event', label: 'Evento' },
            { id: 'conf-org', label: 'Organizadores' }
          ]
        },
        { 
          id: 'integrations', 
          label: 'Ferramentas', 
          icon: 'construction',
          subItems: [
            { id: 'conf-func', label: 'Funcionalidades' },
            { id: 'conf-int', label: 'Integrações' }
          ]
        },
      ]
    }
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-[#f8fafc] dark:bg-[#121214] border-r border-slate-200 dark:border-white/5 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && <Logo size="sm" />}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-8">
        {sections.map(section => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                {section.title}
              </p>
            )}
            {section.items.map(item => (
              <NavButton 
                key={item.id}
                {...item}
                isActive={currentPage === item.id}
                isCollapsed={isCollapsed}
                onClick={() => navigateTo(item.id)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!isCollapsed && <span className="text-[13px] font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
