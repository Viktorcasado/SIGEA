
import React from 'react';

interface BottomNavProps {
  currentPage: string;
  navigateTo: (page: string) => void;
  role: 'PARTICIPANT' | 'ORGANIZER';
  toggleSidebar: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, navigateTo, role, toggleSidebar }) => {
  const rootPages = ['home', 'events', 'certificates', 'profile'];
  if (!rootPages.includes(currentPage)) return null;

  const tabs = [
    { id: 'home', label: role === 'ORGANIZER' ? 'Painel' : 'Início', icon: 'home_app_logo' },
    { id: 'events', label: 'Explorar', icon: 'search' },
    { id: 'certificates', label: 'Títulos', icon: 'workspace_premium' },
    { id: 'profile', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-3xl border-t border-zinc-100 dark:border-white/5 pb-[env(safe-area-inset-bottom,12px)] pt-3 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around max-w-md mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (window.navigator.vibrate) window.navigator.vibrate(10);
                navigateTo(tab.id);
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1 group relative outline-none"
            >
              <div className={`
                relative h-8 w-16 rounded-full flex items-center justify-center transition-all duration-300 ease-out
                ${isActive ? 'bg-primary/20 scale-100' : 'bg-transparent scale-75 group-active:scale-95'}
              `}>
                <span 
                  className={`material-symbols-outlined text-[26px] transition-colors duration-300 ${isActive ? 'text-primary' : 'text-zinc-400 dark:text-zinc-500'}`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400" }}
                >
                  {tab.icon}
                </span>
                
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 blur-md rounded-full -z-10 animate-pulse"></div>
                )}
              </div>

              <span className={`
                text-[10px] font-bold tracking-tight transition-all duration-300
                ${isActive ? 'text-primary opacity-100 translate-y-0' : 'text-zinc-500 dark:text-zinc-600 opacity-80 translate-y-0.5'}
              `}>
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
