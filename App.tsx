
import React, { useState, useEffect } from 'react';
import { UserRole, Event as SIGEAEvent } from './types.ts';
import { supabase } from './supabaseClient.ts';

import Home from './pages/Home.tsx';
import EventsList from './pages/EventsList.tsx';
import EventDetails from './pages/EventDetails.tsx';
import Registration from './pages/Registration.tsx';
import Certificates from './pages/Certificates.tsx';
import Profile from './pages/Profile.tsx';
import Help from './pages/Help.tsx';
import MyTicket from './pages/MyTicket.tsx';
import Login from './pages/Login.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import OrganizerDashboard from './pages/OrganizerDashboard.tsx';
import CreateEvent from './pages/CreateEvent.tsx';
import ManageEvent from './pages/ManageEvent.tsx';
import CheckIn from './pages/CheckIn.tsx';
import PublishSuccess from './pages/PublishSuccess.tsx';
import Welcome from './pages/Welcome.tsx';
import Reports from './pages/Reports.tsx';
import Integrations from './pages/Integrations.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import BottomNav from './components/BottomNav.tsx';
import Sidebar from './components/Sidebar.tsx';

const App: React.FC = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    return localStorage.getItem('sigea_seen_welcome') === 'true';
  });
  
  const [isHydrating, setIsHydrating] = useState(true);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  
  const isRecoveryRoute = () => {
    const hash = window.location.hash;
    const search = window.location.search;
    return window.location.pathname.includes('reset-password') || hash.includes('type=recovery') || search.includes('reset-password');
  };

  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (isRecoveryRoute()) return 'reset-password';
    return localStorage.getItem('sigea_last_page') || 'home';
  });
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(() => {
    return localStorage.getItem('sigea_last_event_id');
  });

  const [events, setEvents] = useState<SIGEAEvent[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('sigea_theme') as any) || 'dark';
  });

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        // Normaliza os dados do banco para a interface (image_url -> imageUrl)
        const normalizedEvents = data.map(e => ({
          ...e,
          imageUrl: e.imageUrl || e.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000'
        }));
        setEvents(normalizedEvents);
      }
    } catch (err) {
      console.error("Erro ao carregar banco real:", err);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [theme]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          updateAuthState(session);
          if (isRecoveryRoute()) setCurrentPage('reset-password');
        } else {
          setAuthStatus(false);
        }
        await fetchEvents();
      } catch (err) {
        console.error("Erro crítico na inicialização:", err);
        setAuthStatus(false);
      } finally {
        setIsHydrating(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        updateAuthState(session);
      } else if (event === 'SIGNED_OUT') {
        handleLogoutCleanUp();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAuthState = (session: any) => {
    const metadata = session.user.user_metadata;
    const profileData = {
      id: session.user.id,
      name: metadata?.name || 'Usuário SIGEA',
      email: session.user.email,
      campus: metadata?.campus || 'IFAL - Campus Maceió',
      photo: metadata?.photo_url || metadata?.photo || ''
    };
    setUserProfile(profileData);
    setRole((metadata?.role || UserRole.PARTICIPANT) as UserRole);
    setAuthStatus(true);
  };

  const handleLogoutCleanUp = () => {
    setAuthStatus(false);
    setUserProfile(null);
    localStorage.removeItem('sigea_last_page');
    setCurrentPage('home');
  };

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    if (id) {
      setSelectedEventId(id);
      localStorage.setItem('sigea_last_event_id', id);
    }
    localStorage.setItem('sigea_last_page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      const { error } = await supabase.auth.updateUser({ data });
      if (!error) {
        setUserProfile((prev: any) => ({
          ...prev, 
          name: data.name || prev.name,
          campus: data.campus || prev.campus,
          photo: data.photo_url || data.photo || prev.photo
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro na atualização:", err);
      return false;
    }
  };

  const handleAddEvent = (newEvent: SIGEAEvent) => {
    // Garante que o novo evento tenha imageUrl mapeado corretamente antes de entrar no estado
    const sanitized = {
      ...newEvent,
      imageUrl: newEvent.imageUrl || (newEvent as any).image_url
    };
    setEvents(prev => [sanitized, ...prev]);
    // Não precisamos chamar fetchEvents() imediatamente aqui para evitar sobrescrever o estado local rápido demais
  };

  if (isHydrating) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center">
        <div className="size-16 border-[5px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-8 text-[11px] font-black text-primary uppercase tracking-[0.5em]">SIGEA</p>
      </div>
    );
  }

  if (!hasSeenWelcome && !isRecoveryRoute()) return <Welcome onContinue={() => { localStorage.setItem('sigea_seen_welcome', 'true'); setHasSeenWelcome(true); }} />;
  
  if (!authStatus && currentPage !== 'reset-password') {
    return <Login onLogin={() => setAuthStatus(true)} onBack={() => setHasSeenWelcome(false)} darkMode={theme === 'dark'} setDarkMode={() => {}} />;
  }

  const commonProps = { navigateTo, events, profile: userProfile };

  const renderContent = () => {
    if (currentPage === 'reset-password') return <ResetPassword navigateTo={navigateTo} />;

    switch (currentPage) {
      case 'home': return role === UserRole.ORGANIZER ? <OrganizerDashboard {...commonProps} onNotify={() => {}} /> : <Home {...commonProps} onNotify={() => {}} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} role={role} />;
      case 'register': return <Registration {...commonProps} eventId={selectedEventId} onUpdateProfile={handleUpdateProfile} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} events={events} user={userProfile} />;
      case 'profile': return (
        <Profile 
          {...commonProps} 
          theme={theme} 
          setTheme={setTheme} 
          role={role} 
          toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} 
          onLogout={handleLogout} 
          onDeleteAccount={async () => {}} 
          onUpdate={handleUpdateProfile} 
        />
      );
      case 'ticket': 
        const ticketEvent = events.find(e => e.id === selectedEventId);
        return <MyTicket navigateTo={navigateTo} profile={userProfile} event={ticketEvent} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={handleAddEvent} />;
      case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={() => fetchEvents()} onArchive={() => {}} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} eventId={selectedEventId} />;
      case 'publish-success': 
        const successEvent = events.find(e => e.id === selectedEventId);
        return <PublishSuccess navigateTo={navigateTo} event={successEvent} />;
      case 'reports': return <Reports navigateTo={navigateTo} />;
      case 'integrations': return <Integrations navigateTo={navigateTo} />;
      case 'help': return <Help navigateTo={navigateTo} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  const isNavigationVisible = ['home', 'events', 'certificates', 'profile', 'reports', 'help', 'create-event', 'check-in', 'integrations'].includes(currentPage);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#09090b]">
      {isNavigationVisible && (
        <Sidebar 
          currentPage={currentPage} 
          navigateTo={navigateTo} 
          role={role} 
          profile={userProfile} 
          onLogout={handleLogout} 
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-24 lg:pb-8">{renderContent()}</main>
        <BottomNav currentPage={currentPage} navigateTo={navigateTo} role={role} />
        <AIAssistant events={events} />
      </div>
    </div>
  );
};

export default App;
