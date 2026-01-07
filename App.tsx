
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserRole, Event as SIGEAEvent } from './types.ts';
import { supabase, handleSupabaseError } from './supabaseClient.ts';
import { MOCK_EVENTS } from './constants.tsx';

import Home from './pages/Home.tsx';
import EventsList from './pages/EventsList.tsx';
import EventDetails from './pages/EventDetails.tsx';
import Registration from './pages/Registration.tsx';
import Certificates from './pages/Certificates.tsx';
import Profile from './pages/Profile.tsx';
import CheckIn from './pages/CheckIn.tsx';
import MyTicket from './pages/MyTicket.tsx';
import Login from './pages/Login.tsx';
import OrganizerDashboard from './pages/OrganizerDashboard.tsx';
import CreateEvent from './pages/CreateEvent.tsx';
import ManageEvent from './pages/ManageEvent.tsx';
import PublishSuccess from './pages/PublishSuccess.tsx';
import Logo from './components/Logo.tsx';
import AIAssistant from './components/AIAssistant.tsx';

type ThemeMode = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(localStorage.getItem('sigea_demo') === 'true');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('sigea_theme') as ThemeMode;
    return saved || 'system';
  });
  
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<SIGEAEvent[]>(MOCK_EVENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Estado para controlar se a sidebar desktop está recolhida
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sigea_sidebar_collapsed') === 'true';
  });

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const isIOS = useMemo(() => /iPad|iPhone|iPod/.test(navigator.userAgent), []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let shouldBeDark = theme === 'dark';
      if (theme === 'system') shouldBeDark = mediaQuery.matches;
      shouldBeDark ? root.classList.add('dark') : root.classList.remove('dark');
    };

    applyTheme();
    localStorage.setItem('sigea_theme', theme);

    const handleChange = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const fetchInitialData = useCallback(async () => {
    if (isDemoMode) { setEvents(MOCK_EVENTS); return; }
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) setEvents(data as SIGEAEvent[]);
    } catch (e) { setEvents(MOCK_EVENTS); } finally { setIsSyncing(false); }
  }, [isDemoMode]);

  const checkAuth = useCallback(async (demoMode: boolean = false) => {
    setIsLoading(true);
    setAuthError(null);
    if (demoMode || isDemoMode) {
      localStorage.setItem('sigea_demo', 'true');
      setIsDemoMode(true);
      setUserProfile({ id: 'demo-user', name: 'Convidado SIGEA', email: 'visitante@ifal.edu.br', campus: 'Campus Maceió', photo: '' });
      setIsAuthenticated(true);
      setEvents(MOCK_EVENTS);
      setIsLoading(false);
      return;
    }
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (user) {
        let profileData = null;
        try { const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(); profileData = data; } catch (e) {}
        setUserProfile({
          id: user.id,
          name: user.user_metadata?.name || profileData?.name || 'Usuário',
          email: user.email,
          campus: user.user_metadata?.campus || profileData?.campus || 'Não Informado',
          photo: user.user_metadata?.photo_url || profileData?.photo_url || ''
        });
        setRole((user.user_metadata?.role || profileData?.role || 'PARTICIPANT') as UserRole);
        setIsAuthenticated(true);
        await fetchInitialData();
      } else { setIsAuthenticated(false); }
    } catch (error: any) { setAuthError(handleSupabaseError(error)); setIsAuthenticated(false); } finally { setIsLoading(false); }
  }, [fetchInitialData, isDemoMode]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sigea_sidebar_collapsed', String(newState));
  };

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    setSelectedEventId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = async () => {
    localStorage.removeItem('sigea_demo');
    setIsDemoMode(false);
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 px-8 text-center transition-colors">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-zinc-400">Iniciando SIGEA...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={checkAuth} darkMode={theme === 'dark'} setDarkMode={() => setTheme(theme === 'dark' ? 'light' : 'dark')} errorMsg={authError} />;
  }

  const commonProps = { navigateTo, events, profile: userProfile, onUpdate: () => {}, isSyncing };

  const renderContent = () => {
    if (role === UserRole.ORGANIZER && currentPage === 'home') return <OrganizerDashboard {...commonProps} onNotify={() => {}} />;
    switch (currentPage) {
      case 'home': return <Home {...commonProps} onNotify={() => {}} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} />;
      case 'register': return <Registration {...commonProps} eventId={selectedEventId} onUpdateProfile={async () => {}} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} events={events} />;
      case 'profile': return <Profile {...commonProps} theme={theme} setTheme={setTheme} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={logout} onDeleteAccount={async () => {}} />;
      case 'ticket': return <MyTicket navigateTo={navigateTo} profile={userProfile} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={(e) => setEvents([e, ...events])} />;
      case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={() => {}} onArchive={() => {}} />;
      case 'publish-success': return <PublishSuccess navigateTo={navigateTo} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  const isFullscreenPage = ['check-in', 'register', 'ticket', 'details', 'create-event', 'publish-success'].includes(currentPage);

  const NavItem = ({ page, icon, label }: { page: string, icon: string, label: string }) => {
    const active = currentPage === page;
    return (
      <button 
        onClick={() => navigateTo(page)} 
        className={`flex flex-col lg:flex-row items-center lg:gap-4 lg:w-full lg:px-4 lg:py-3 transition-all relative group rounded-2xl ${active ? 'text-primary' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}
      >
        <div className={`size-12 lg:size-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${active ? 'bg-primary/10 backdrop-blur-md shadow-[0_8px_32px_rgba(16,185,129,0.15)] ring-1 ring-primary/20' : 'group-hover:bg-slate-100 dark:group-hover:bg-zinc-800/50'}`}>
          <span className={`material-symbols-outlined text-[28px] lg:text-[24px] ${active ? 'filled scale-110' : 'scale-100'}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        </div>
        
        {/* Label (Oculto se recolhido) */}
        {isDesktop && !isSidebarCollapsed && (
          <span className={`text-[11px] font-[900] uppercase tracking-[0.1em] transition-all duration-300 opacity-100 whitespace-nowrap overflow-hidden ${active ? 'text-primary' : 'text-slate-500 dark:text-zinc-400'}`}>
            {label}
          </span>
        )}

        {/* Tooltip (Apenas se recolhido) */}
        {isDesktop && isSidebarCollapsed && (
          <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-[100] whitespace-nowrap border border-white/10">
            {label}
          </div>
        )}

        {!isDesktop && active && (
          <div className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#10b981]"></div>
        )}
      </button>
    );
  };

  return (
    <div className={`flex min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors ${isDesktop ? 'flex-row' : 'flex-col'}`}>
      
      {isDesktop && !isFullscreenPage && (
        <aside 
          className={`h-screen sticky top-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 flex flex-col py-8 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSidebarCollapsed ? 'w-24 px-4' : 'w-72 px-6'}`}
        >
          {/* Toggle Button */}
          <button 
            onClick={toggleSidebar}
            className="absolute -right-4 top-16 size-8 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-lg active:scale-90 z-50"
          >
            <span className={`material-symbols-outlined text-xl transition-transform duration-500 ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}>
              chevron_left
            </span>
          </button>

          <div className={`mb-12 transition-all duration-300 ${isSidebarCollapsed ? 'items-center flex flex-col' : 'px-2'}`}>
            <Logo size={isSidebarCollapsed ? "sm" : "md"} />
            {!isSidebarCollapsed && <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-2">IFAL • SIGEA System</p>}
          </div>
          
          {isDemoMode && !isSidebarCollapsed && (
             <div className="mb-8 px-4 py-3 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-2 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
                <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Demonstração</span>
             </div>
          )}
          
          <nav className="flex-1 flex flex-col gap-2">
            <NavItem page="home" icon="roofing" label="Início" />
            <NavItem page="events" icon="explore_nearby" label="Explorar" />
            <NavItem page="certificates" icon="military_tech" label="Certificados" />
            <NavItem page="profile" icon="account_circle" label="Perfil" />
          </nav>

          <div className="mt-auto">
             <div className={`p-3 bg-slate-50/50 dark:bg-zinc-800/30 backdrop-blur-md rounded-3xl flex items-center transition-all duration-300 border border-slate-100 dark:border-white/5 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 shrink-0">
                   {userProfile?.name?.charAt(0)}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0 animate-in slide-in-from-left-2 duration-300">
                     <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase">{userProfile?.name}</p>
                     <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{role}</p>
                  </div>
                )}
             </div>
          </div>
        </aside>
      )}

      <main className={`flex-1 transition-all ${isDesktop ? 'px-4 lg:px-10' : 'w-full'} ${!isFullscreenPage && !isDesktop ? 'pb-32' : ''}`}>
        <div className={`mx-auto ${isDesktop && !isFullscreenPage ? 'max-w-7xl py-10' : ''}`}>
          {renderContent()}
        </div>
      </main>

      <AIAssistant events={events} />

      {!isDesktop && !isFullscreenPage && (
        <div className="fixed bottom-0 left-0 w-full z-[5000] px-6 pb-[calc(1.2rem+var(--safe-bottom))] animate-in slide-in-from-bottom duration-700">
          <nav className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-around h-20 border border-white/20 dark:border-white/5 relative overflow-hidden ring-1 ring-black/5">
             {isIOS && <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-200/50 dark:bg-white/10 rounded-full"></div>}
             <NavItem page="home" icon="roofing" label="Início" />
             <NavItem page="events" icon="explore_nearby" label="Eventos" />
             <NavItem page="certificates" icon="military_tech" label="Métricas" />
             <NavItem page="profile" icon="account_circle" label="Perfil" />
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
