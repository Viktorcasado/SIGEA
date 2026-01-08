
import React, { useState, useEffect } from 'react';
import { UserRole, Event as SIGEAEvent } from './types.ts';
import { supabase, handleSupabaseError } from './supabaseClient.ts';
import { MOCK_EVENTS } from './constants.tsx';

import Home from './pages/Home.tsx';
import EventsList from './pages/EventsList.tsx';
import EventDetails from './pages/EventDetails.tsx';
import Registration from './pages/Registration.tsx';
import Certificates from './pages/Certificates.tsx';
import Profile from './pages/Profile.tsx';
import Help from './pages/Help.tsx';
import CheckIn from './pages/CheckIn.tsx';
import MyTicket from './pages/MyTicket.tsx';
import Login from './pages/Login.tsx';
import OrganizerDashboard from './pages/OrganizerDashboard.tsx';
import CreateEvent from './pages/CreateEvent.tsx';
import ManageEvent from './pages/ManageEvent.tsx';
import PublishSuccess from './pages/PublishSuccess.tsx';
import Welcome from './pages/Welcome.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import BottomNav from './components/BottomNav.tsx';

const App: React.FC = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    return localStorage.getItem('sigea_seen_welcome') === 'true';
  });
  
  // Estados de Persistência
  const [isHydrating, setIsHydrating] = useState(true);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  
  // Reidratação de Navegação
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('sigea_last_page') || 'home';
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(() => {
    return localStorage.getItem('sigea_last_event_id');
  });

  const [events, setEvents] = useState<SIGEAEvent[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('sigea_theme') as any) || 'dark';
  });

  // Persistência de Tema
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    localStorage.setItem('sigea_theme', theme);
  }, [theme]);

  // Busca de Eventos
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data && data.length > 0) setEvents(data);
        else setEvents(MOCK_EVENTS);
      } catch (err) {
        setEvents(MOCK_EVENTS);
      } finally {
        // Apenas encerra hidratação se o auth já estiver resolvido
        if (authStatus !== null) setIsHydrating(false);
      }
    };
    fetchEvents();
  }, [authStatus]);

  // Inicialização de Auth com Persistência Superior
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      updateAuthState(session);
      if (events.length > 0 || authStatus === false) setIsHydrating(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuthState(session);
    });

    initAuth();
    return () => subscription.unsubscribe();
  }, [events.length]);

  const updateAuthState = (session: any) => {
    if (session) {
      const metadata = session.user.user_metadata;
      setUserProfile({
        id: session.user.id,
        name: metadata?.name || 'Usuário SIGEA',
        email: session.user.email,
        campus: metadata?.campus || localStorage.getItem('sigea_last_campus') || 'IFAL - Campus Maceió',
        photo: metadata?.photo_url || ''
      });
      setRole((metadata?.role || UserRole.PARTICIPANT) as UserRole);
      setAuthStatus(true);
    } else {
      setAuthStatus(false);
      setIsHydrating(false);
    }
  };

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    setSelectedEventId(id);
    localStorage.setItem('sigea_last_page', page);
    if (id) localStorage.setItem('sigea_last_event_id', id);
    else localStorage.removeItem('sigea_last_event_id');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueFromWelcome = () => {
    localStorage.setItem('sigea_seen_welcome', 'true');
    setHasSeenWelcome(true);
  };

  const handleUpdateProfile = async (updatedData: any) => {
    try {
      if (updatedData.campus) localStorage.setItem('sigea_last_campus', updatedData.campus);
      if (userProfile?.id) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            name: updatedData.name || userProfile.name, 
            campus: updatedData.campus || userProfile.campus, 
            photo_url: updatedData.photo || userProfile.photo 
          }
        });
        if (error) throw error;
      }
      setUserProfile((prev: any) => ({ ...prev, ...updatedData }));
      return true;
    } catch (error: any) {
      setUserProfile((prev: any) => ({ ...prev, ...updatedData }));
      return true; 
    }
  };

  const handleLogout = async () => {
    setIsHydrating(true);
    localStorage.removeItem('sigea_last_page');
    localStorage.removeItem('sigea_last_event_id');
    localStorage.removeItem('sigea_demo');
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Tela de Carregamento Institucional (Hydration Shield)
  if (isHydrating) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center z-[99999] animate-in fade-in duration-500">
        <div className="relative size-24 mb-8">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-xl tracking-tighter">SI</span>
          </div>
        </div>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Sincronizando SIGEA...</p>
      </div>
    );
  }

  if (!hasSeenWelcome) {
    return <Welcome onContinue={handleContinueFromWelcome} />;
  }

  if (!authStatus) {
    return (
      <Login 
        onLogin={() => {}} 
        onBack={() => setHasSeenWelcome(false)}
        darkMode={theme === 'dark'} 
        setDarkMode={() => {}} 
      />
    );
  }

  const commonProps = { navigateTo, events, profile: userProfile, isSyncing: false };

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return role === UserRole.ORGANIZER ? <OrganizerDashboard {...commonProps} onNotify={() => {}} /> : <Home {...commonProps} onNotify={() => {}} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} role={role} />;
      case 'register': return <Registration {...commonProps} eventId={selectedEventId} onUpdateProfile={handleUpdateProfile} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} events={events} />;
      case 'profile': return <Profile {...commonProps} theme={theme} setTheme={setTheme} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={handleLogout} onDeleteAccount={async () => {}} onUpdate={handleUpdateProfile} />;
      case 'help': return <Help navigateTo={navigateTo} />;
      case 'ticket': return <MyTicket navigateTo={navigateTo} profile={userProfile} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={(e) => setEvents([e, ...events])} />;
      case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={(id) => { setEvents(events.filter(e => e.id !== id)); navigateTo('home'); }} onArchive={() => {}} />;
      case 'publish-success': return <PublishSuccess navigateTo={navigateTo} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b]">
      <main className="flex-1 w-full pb-[calc(env(safe-area-inset-bottom,0px)+80px)]">
        {renderContent()}
      </main>
      
      <BottomNav 
        currentPage={currentPage} 
        navigateTo={navigateTo} 
        role={role}
      />
      
      <AIAssistant events={events} />
    </div>
  );
};

export default App;
