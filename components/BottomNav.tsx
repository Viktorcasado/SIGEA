
import React from 'react';

interface BottomNavProps {
  currentPage: string;
  navigateTo: (page: string) => void;
  role: 'PARTICIPANT' | 'ORGANIZER';
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, navigateTo, role }) => {
  const rootPages = ['home', 'events', 'certificates', 'profile'];
  if (!rootPages.includes(currentPage)) return null;

  const tabs = [
    { id: 'home', label: role === 'ORGANIZER' ? 'Dash' : 'Início', icon: 'home' },
    { id: 'events', label: 'Explorar', icon: 'explore' },
    { id: 'certificates', label: 'Títulos', icon: 'workspace_premium' },
    { id: 'profile', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-8 pb-[env(safe-area-inset-bottom,24px)] pt-6 bg-white/90 dark:bg-[#0b0b0d]/90 backdrop-blur-3xl border-t border-slate-200/50 dark:border-white/10 animate-in slide-in-from-bottom duration-700 shadow-[0_-15px_40px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-500 relative group active:scale-90 ${
                isActive ? 'text-primary' : 'text-slate-400 dark:text-zinc-600'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span 
                  className={`material-symbols-outlined text-[28px] transition-all duration-500 ${isActive ? 'filled scale-110 drop-shadow-[0_0_12px_#10b981]' : 'group-hover:scale-105'}`} 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 700" : "'FILL' 0, 'wght' 400" }}
                >
                  {tab.icon}
                </span>
                {isActive && (
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse -z-10"></div>
                )}
              </div>
              <span className={`text-[8px] font-[1000] uppercase tracking-[0.25em] transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-0.5'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_12px_#10b981] animate-in zoom-in duration-500"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
