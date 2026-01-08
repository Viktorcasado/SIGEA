
import React from 'react';

interface BottomNavProps {
  currentPage: string;
  navigateTo: (page: string) => void;
  role: 'PARTICIPANT' | 'ORGANIZER';
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, navigateTo, role }) => {
  // Define quais páginas mostram o menu
  const rootPages = ['home', 'events', 'certificates', 'profile'];
  if (!rootPages.includes(currentPage)) return null;

  const tabs = [
    { id: 'home', label: role === 'ORGANIZER' ? 'Dash' : 'Início', icon: 'home' },
    { id: 'events', label: 'Explorar', icon: 'explore' },
    { id: 'certificates', label: 'Títulos', icon: 'workspace_premium' },
    { id: 'profile', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-[env(safe-area-inset-bottom,24px)] pt-4 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-3xl border-t border-slate-200/50 dark:border-white/5 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 relative group active:scale-90 ${
                isActive ? 'text-primary' : 'text-slate-400 dark:text-zinc-500'
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[26px] transition-all ${isActive ? 'filled scale-110' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {tab.icon}
                </span>
                {isActive && (
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse"></div>
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#10b981]"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
