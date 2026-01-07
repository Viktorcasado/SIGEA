
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<SIGEAEvent[]>(MOCK_EVENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Detecção de OS e Tela
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const isIOS = useMemo(() => /iPad|iPhone|iPod/.test(navigator.userAgent), []);
  const isAndroid = useMemo(() => /Android/.test(navigator.userAgent), []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchInitialData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data && data.length > 0) {
        setEvents(data as SIGEAEvent[]);
      }
    } catch (e) { 
      console.warn("Modo offline ativo.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (user) {
        let profileData = null;
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          profileData = data;
        } catch (e) {}
        
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
      } else {
        setIsAuthenticated(false);
      }
    } catch (error: any) { 
      setAuthError(handleSupabaseError(error));
      setIsAuthenticated(false);
    } finally { 
      setIsLoading(false); 
    }
  }, [fetchInitialData]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    setSelectedEventId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-8 text-center">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Sincronizando SIGEA...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={checkAuth} darkMode={true} setDarkMode={() => {}} errorMsg={authError} />;
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
      case 'profile': return <Profile {...commonProps} darkMode={true} setDarkMode={() => {}} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={() => supabase.auth.signOut().then(() => setIsAuthenticated(false))} onDeleteAccount={async () => {}} />;
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
        className={`flex flex-col lg:flex-row items-center lg:gap-4 lg:w-full lg:px-6 lg:py-4 transition-all ${active ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
      >
        <span className={`material-symbols-outlined text-[28px] lg:text-[24px] ${active ? 'filled' : ''}`}>{icon}</span>
        {isDesktop && <span className="text-sm font-bold uppercase tracking-widest">{label}</span>}
        {!isDesktop && active && <div className="absolute -bottom-1 size-1 bg-primary rounded-full"></div>}
      </button>
    );
  };

  return (
    <div className={`flex min-h-screen bg-zinc-950 ${isDesktop ? 'flex-row' : 'flex-col'}`}>
      
      {/* Sidebar Desktop */}
      {isDesktop && !isFullscreenPage && (
        <aside className="w-72 h-screen sticky top-0 bg-zinc-900 border-r border-white/5 flex flex-col py-10 shrink-0">
          <div className="px-8 mb-12">
            <Logo size="md" />
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-2">IFAL • SIGEA System</p>
          </div>
          
          <nav className="flex-1 flex flex-col gap-2">
            <NavItem page="home" icon="home" label="Início" />
            <NavItem page="events" icon="explore" label="Explorar" />
            <NavItem page="certificates" icon="workspace_premium" label="Certificados" />
            <NavItem page="profile" icon="person" label="Perfil" />
          </nav>

          <div className="px-6 mt-auto">
             <div className="p-4 bg-zinc-800 rounded-3xl flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white font-black">
                   {userProfile?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black text-white truncate uppercase">{userProfile?.name}</p>
                   <p className="text-[9px] font-bold text-zinc-500 uppercase">{role}</p>
                </div>
             </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 transition-all ${isDesktop ? 'max-w-7xl mx-auto' : 'w-full'} ${!isFullscreenPage && !isDesktop ? 'pb-24' : ''}`}>
        <div className={`${isDesktop && !isFullscreenPage ? 'p-10' : ''}`}>
          {renderContent()}
        </div>
      </main>

      {/* Bottom Nav Mobile */}
      {!isDesktop && !isFullscreenPage && (
        <div className="fixed bottom-0 left-0 w-full z-[5000] px-6 pb-[calc(1.2rem+var(--safe-bottom))] animate-in slide-in-from-bottom duration-700">
          <nav className="glass rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around h-16 border border-white/10 relative overflow-hidden">
             {/* Indicador visual de OS */}
             {isIOS && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 rounded-full"></div>}
             <NavItem page="home" icon="home" label="Início" />
             <NavItem page="events" icon="explore" label="Eventos" />
             <NavItem page="certificates" icon="workspace_premium" label="Métricas" />
             <NavItem page="profile" icon="person" label="Perfil" />
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
