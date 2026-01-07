
import React, { useState, useEffect, useCallback } from 'react';
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<SIGEAEvent[]>(MOCK_EVENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('sigea_dark');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    const baseTitle = "SIGEA";
    const pageTitles: Record<string, string> = {
      home: "Início",
      events: "Explorar",
      details: "Detalhes",
      register: "Inscrição",
      certificates: "Certificados",
      profile: "Perfil",
      ticket: "Ticket"
    };
    document.title = `${pageTitles[currentPage] || baseTitle} | IFAL`;
  }, [currentPage]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('sigea_dark', darkMode.toString());
  }, [darkMode]);

  const fetchInitialData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (!error && data && data.length > 0) {
        setEvents(data as SIGEAEvent[]);
      } else {
        setEvents(MOCK_EVENTS);
      }
    } catch (e) { 
      setEvents(MOCK_EVENTS);
      console.warn("Utilizando catálogo offline.");
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);

    // Timeout de segurança: Se em 8 segundos não houver resposta, falha para permitir modo visitante
    const authTimeout = setTimeout(() => {
      if (isLoading) {
        setAuthError("Tempo de conexão esgotado. Verifique sua rede.");
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    }, 8000);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        const msg = handleSupabaseError(userError);
        if (msg.includes('conexão') || msg.includes('fetch')) {
          setAuthError(msg);
        }
        setIsAuthenticated(false);
        return;
      }

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
          photo: user.user_metadata?.photo_url || profileData?.photo_url || user.user_metadata?.avatar_url || ''
        });
        setRole((user.user_metadata?.role || profileData?.role || 'PARTICIPANT') as UserRole);
        setIsAuthenticated(true);
        await fetchInitialData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error: any) { 
      const msg = handleSupabaseError(error);
      setAuthError(msg);
      setIsAuthenticated(false);
    } finally { 
      clearTimeout(authTimeout);
      setIsLoading(false); 
    }
  }, [fetchInitialData]);

  const handleGuestLogin = () => {
    setUserProfile({
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      name: 'Visitante (Offline)',
      email: 'visitante@ifal.edu.br',
      campus: 'Campus Maceió',
      photo: ''
    });
    setRole(UserRole.PARTICIPANT);
    setIsAuthenticated(true);
    setIsLoading(false);
    setAuthError(null);
    setEvents(MOCK_EVENTS);
  };

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) checkAuth();
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserProfile(null);
        setCurrentPage('home');
      }
    });
    return () => subscription.unsubscribe();
  }, [checkAuth]);

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    setSelectedEventId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-zinc-950 px-8 text-center">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Autenticando SIGEA...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={checkAuth} 
        onGuestLogin={handleGuestLogin} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        errorMsg={authError} 
      />
    );
  }

  const renderContent = () => {
    const common = { 
      navigateTo, 
      events, 
      profile: userProfile, 
      onUpdate: (u: any) => setUserProfile({...userProfile, ...u}), 
      onNotify: () => {}, 
      hasUnread: false 
    };

    if (role === UserRole.ORGANIZER && currentPage === 'home') return <OrganizerDashboard {...common} />;

    switch (currentPage) {
      case 'home': return <Home {...common} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} />;
      case 'register': return <Registration {...common} eventId={selectedEventId} onUpdateProfile={() => {}} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} events={events} />;
      case 'profile': return <Profile {...common} darkMode={darkMode} setDarkMode={setDarkMode} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={() => supabase.auth.signOut()} onDeleteAccount={async () => {}} />;
      case 'ticket': return <MyTicket navigateTo={navigateTo} profile={userProfile} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} />;
      default: return <Home {...common} />;
    }
  };

  const hideNav = ['check-in', 'register', 'ticket', 'details'].includes(currentPage);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-zinc-950 relative flex flex-col shadow-2xl overflow-hidden">
      <div className={`flex-1 ${!hideNav ? 'pb-24' : ''}`}>{renderContent()}</div>
      {!hideNav && (
        <div className="fixed bottom-0 left-0 w-full max-w-md mx-auto z-[5000] px-8 pb-[calc(1.5rem+var(--safe-bottom))]">
          <nav className="glass rounded-[2.5rem] shadow-2xl flex items-center justify-around h-16 border border-white/20">
            <button onClick={() => navigateTo('home')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentPage === 'home' ? 'text-primary' : 'text-zinc-300'}`}><span className={`material-symbols-outlined text-[28px] ${currentPage === 'home' ? 'filled' : ''}`}>home</span></button>
            <button onClick={() => navigateTo('events')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentPage === 'events' ? 'text-primary' : 'text-zinc-300'}`}><span className={`material-symbols-outlined text-[28px] ${currentPage === 'events' ? 'filled' : ''}`}>explore</span></button>
            <button onClick={() => navigateTo('certificates')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentPage === 'certificates' ? 'text-primary' : 'text-zinc-300'}`}><span className={`material-symbols-outlined text-[28px] ${currentPage === 'certificates' ? 'filled' : ''}`}>workspace_premium</span></button>
            <button onClick={() => navigateTo('profile')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentPage === 'profile' ? 'text-primary' : 'text-zinc-300'}`}><span className={`material-symbols-outlined text-[28px] ${currentPage === 'profile' ? 'filled' : ''}`}>person</span></button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
