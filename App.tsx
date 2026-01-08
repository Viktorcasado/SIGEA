
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

const App: React.FC = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    return localStorage.getItem('sigea_seen_welcome') === 'true';
  });
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  const [currentPage, setCurrentPage] = useState('home');
  const [events, setEvents] = useState<SIGEAEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }, [theme]);

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
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      updateAuthState(session);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuthState(session);
    });
    initAuth();
    return () => subscription.unsubscribe();
  }, []);

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
    }
  };

  const handleContinueFromWelcome = () => {
    localStorage.setItem('sigea_seen_welcome', 'true');
    setHasSeenWelcome(true);
  };

  const handleBackToWelcome = () => {
    localStorage.removeItem('sigea_seen_welcome');
    setHasSeenWelcome(false);
  };

  const handleUpdateProfile = async (updatedData: any) => {
    try {
      // Persistência Offline
      if (updatedData.campus) localStorage.setItem('sigea_last_campus', updatedData.campus);
      
      // Persistência Supabase (Auth Metadata)
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
      console.error("Erro ao sincronizar campus/perfil:", handleSupabaseError(error));
      // Mesmo com erro de rede, atualizamos o estado local para fluidez da UI
      setUserProfile((prev: any) => ({ ...prev, ...updatedData }));
      return true; 
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEventId(null);
    setCurrentPage('home');
  };

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    setSelectedEventId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!hasSeenWelcome) {
    return <Welcome onContinue={handleContinueFromWelcome} />;
  }

  if (authStatus === null) return null;
  
  if (!authStatus) {
    return (
      <Login 
        onLogin={() => {}} 
        onBack={handleBackToWelcome}
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
      case 'profile': return <Profile {...commonProps} theme={theme} setTheme={setTheme} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={() => { localStorage.removeItem('sigea_demo'); supabase.auth.signOut(); window.location.reload(); }} onDeleteAccount={async () => {}} onUpdate={handleUpdateProfile} />;
      case 'help': return <Help navigateTo={navigateTo} />;
      case 'ticket': return <MyTicket navigateTo={navigateTo} profile={userProfile} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={(e) => setEvents([e, ...events])} />;
      case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={handleDeleteEvent} onArchive={() => {}} />;
      case 'publish-success': return <PublishSuccess navigateTo={navigateTo} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b]">
      <main className="flex-1 w-full">{renderContent()}</main>
      <AIAssistant events={events} />
    </div>
  );
};

export default App;
