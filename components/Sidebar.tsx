
import React, { useState } from 'react';
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
          else onClick();
        }}
        className={`w-full flex items-center gap-4 py-3.5 transition-all duration-300 group relative overflow-hidden ${
          isCollapsed ? 'justify-center px-0' : 'px-6'
        } ${
          isActive 
          ? 'bg-primary/10 text-primary border-r-[4px] border-primary' 
          : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[24px] shrink-0 transition-transform duration-300 group-hover:scale-110" 
          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>
        
        <span 
          className={`text-[13px] font-bold text-left uppercase tracking-tight whitespace-nowrap transition-all duration-300 ${
            isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 flex-1'
          }`}
        >
          {label}
        </span>

        {!isCollapsed && subItems && (
          <span className={`material-symbols-outlined text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        )}
      </button>

      {!isCollapsed && subItems && isOpen && (
        <div className="ml-12 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
          {subItems.map(sub => (
            <button 
              key={sub.id}
              onClick={() => onClick()}
              className="w-full text-left py-2.5 px-3 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <div className="size-1.5 bg-zinc-700 rounded-full shrink-0"></div>
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
  currentPage, navigateTo, role, profile, onLogout, openPortal, isOpenMobile, setOpenMobile, selectedEventId 
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sigea_sidebar_collapsed') === 'true';
  });

  const sections = [
    {
      title: "GESTÃO",
      items: [
        { id: 'home', label: 'Início', icon: 'home' },
        { id: 'participants', label: 'Pessoas', icon: 'person' },
        { id: 'profile', label: 'Meu Perfil', icon: 'account_circle' },
      ]
    },
    {
      title: "PRÉ-EVENTO",
      items: [
        { id: 'register', label: 'Inscrições', icon: 'app_registration' },
        { id: 'details', label: 'Página do Evento', icon: 'description' },
        { id: 'schedule', label: 'Programação', icon: 'calendar_month' },
      ]
    },
    {
      title: "PÓS-EVENTO",
      items: [
        { id: 'certificates', label: 'Certificados', icon: 'military_tech' },
      ]
    }
  ];

  const handleNav = (id: string) => {
    if (['details', 'schedule', 'register', 'manage-event'].includes(id) && selectedEventId) {
       navigateTo(id, selectedEventId);
    } else {
       navigateTo(id);
    }
    setOpenMobile(false);
  };

  return (
    <>
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden animate-in fade-in duration-500"
          onClick={() => setOpenMobile(false)}
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-[101] lg:sticky lg:flex flex-col h-screen 
          bg-[#09090b] border-r border-white/5 
          transition-all duration-500 ease-in-out shadow-2xl lg:shadow-none
          ${isOpenMobile ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-24' : 'lg:w-[300px]'}
        `}
      >
        <div className={`px-8 pt-12 pb-14 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <Logo size="md" dark />}
          <button 
            onClick={() => {
               const newVal = !isCollapsed;
               setIsCollapsed(newVal);
               localStorage.setItem('sigea_sidebar_collapsed', String(newVal));
            }}
            className="p-2.5 rounded-xl hover:bg-white/5 text-zinc-500 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isCollapsed ? 'menu' : 'menu_open'}
            </span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-10">
          {sections.map(section => (
            <div key={section.title} className="space-y-4">
              <p className={`px-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] transition-opacity duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map(item => (
                  <NavButton 
                    key={item.id}
                    {...item}
                    isActive={currentPage === item.id}
                    isCollapsed={isCollapsed}
                    onClick={() => handleNav(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-10 border-t border-white/5 mt-auto">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all group overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-[24px] shrink-0 group-hover:rotate-12 transition-transform">logout</span>
            <span className={`text-[13px] font-bold uppercase tracking-tight whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}>
              Sair da Conta
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
