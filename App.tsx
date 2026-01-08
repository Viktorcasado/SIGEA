
import React, { useState, useEffect } from 'react';
import { UserRole, Event as SIGEAEvent } from './types.ts';
import { supabase } from './supabaseClient.ts';
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
import AIAssistant from './components/AIAssistant.tsx';

const App: React.FC = () => {
  // null = carregando | false = não autenticado | true = autenticado
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  const [currentPage, setCurrentPage] = useState('home');
  const [events, setEvents] = useState<SIGEAEvent[]>(MOCK_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Verificar sessão inicial
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      updateAuthState(session);
    };

    // 2. Escutar mudanças (Login, Logout, Token Refreshed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuthState(session);
    });

    initAuth();
    return () => subscription.unsubscribe();
  }, []);

  const updateAuthState = (session: any) => {
    if (session) {
      setUserProfile({
        id: session.user.id,
        name: session.user.user_metadata?.name || 'Usuário SIGEA',
        email: session.user.email,
        campus: session.user.user_metadata?.campus || 'IFAL',
        photo: session.user.user_metadata?.photo_url || ''
      });
      setRole((session.user.user_metadata?.role || 'PARTICIPANT') as UserRole);
      setAuthStatus(true);
    } else {
      const isDemo = localStorage.getItem('sigea_demo') === 'true';
      if (isDemo) {
        setUserProfile({ id: 'demo', name: 'Convidado Demo', email: 'demo@ifal.edu.br', campus: 'Maceió' });
        setAuthStatus(true);
      } else {
        setAuthStatus(false);
      }
    }
  };

  const handleLogin = (demoMode: boolean = false) => {
    if (demoMode) {
      localStorage.setItem('sigea_demo', 'true');
      updateAuthState({ user: { id: 'demo' } }); // Fake session
    }
  };

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    setSelectedEventId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Previne o loop: Não renderiza nada (ou um loader) até saber se o usuário está logado
  if (authStatus === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b]">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Iniciando SIGEA...</p>
      </div>
    );
  }

  if (!authStatus) {
    return <Login onLogin={handleLogin} darkMode={true} setDarkMode={() => {}} />;
  }

  const commonProps = { navigateTo, events, profile: userProfile, isSyncing: false };

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return role === UserRole.ORGANIZER ? <OrganizerDashboard {...commonProps} onNotify={() => {}} /> : <Home {...commonProps} onNotify={() => {}} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} />;
      case 'register': return <Registration {...commonProps} eventId={selectedEventId} onUpdateProfile={() => {}} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} events={events} />;
      case 'profile': return <Profile {...commonProps} theme="dark" setTheme={() => {}} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={() => { localStorage.removeItem('sigea_demo'); supabase.auth.signOut(); }} onDeleteAccount={async () => {}} onUpdate={() => {}} />;
      case 'ticket': return <MyTicket navigateTo={navigateTo} profile={userProfile} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={(e) => setEvents([e, ...events])} />;
      case 'publish-success': return <PublishSuccess navigateTo={navigateTo} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <main className="flex-1 w-full">{renderContent()}</main>
      <AIAssistant events={events} />
    </div>
  );
};

export default App;
