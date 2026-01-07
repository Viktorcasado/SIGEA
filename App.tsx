
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
import CreateEvent from './pages/CreateEvent.tsx';
import ManageEvent from './pages/ManageEvent.tsx';
import PublishSuccess from './pages/PublishSuccess.tsx';

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
  
  const darkMode = true;

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
      console.warn("Utilizando catálogo offline.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleAddEvent = (newEvent: SIGEAEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== id));
      setCurrentPage('home');
    } catch (err) {
      alert(handleSupabaseError(err));
    }
  };

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
      const errorMsg = handleSupabaseError(error);
      setAuthError(errorMsg);
      setIsAuthenticated(false);
    } finally { 
      setIsLoading(false); 
    }
  }, [fetchInitialData]);

  const handleUpdateProfile = async (updated: any) => {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userProfile.id,
        ...updated,
        updated_at: new Date()
      });
      if (error) throw error;
      setUserProfile(prev => ({ ...prev, ...updated }));
    } catch (err) {
      alert(handleSupabaseError(err));
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
    return (
      <Login 
        onLogin={checkAuth} 
        darkMode={darkMode} 
        setDarkMode={() => {}} 
        errorMsg={authError} 
      />
    );
  }

  const common = { 
    navigateTo, 
    events, 
    profile: userProfile, 
    onUpdate: handleUpdateProfile,
    isSyncing
  };

  const renderContent = () => {
    if (role === UserRole.ORGANIZER && currentPage === 'home') return <OrganizerDashboard {...common} onNotify={() => {}} />;

    switch (currentPage) {
      case 'home': return <Home {...common} onNotify={() => {}} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} />;
      case 'register': return <Registration {...common} eventId={selectedEventId} onUpdateProfile={handleUpdateProfile} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} events={events} />;
      case 'profile': return <Profile {...common} darkMode={darkMode} setDarkMode={() => {}} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={() => supabase.auth.signOut().then(() => setIsAuthenticated(false))} onDeleteAccount={async () => {}} />;
      case 'ticket': return <MyTicket navigateTo={navigateTo} profile={userProfile} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={handleAddEvent} />;
      case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={handleDeleteEvent} onArchive={() => {}} />;
      case 'publish-success': return <PublishSuccess navigateTo={navigateTo} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      default: return <Home {...common} onNotify={() => {}} />;
    }
  };

  const hideNav = ['check-in', 'register', 'ticket', 'details', 'create-event', 'publish-success'].includes(currentPage);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-zinc-950 relative flex flex-col shadow-2xl overflow-hidden">
      <div className={`flex-1 ${!hideNav ? 'pb-24' : ''}`}>{renderContent()}</div>
      {!hideNav && (
        <div className="fixed bottom-0 left-0 w-full max-w-md mx-auto z-[5000] px-8 pb-[calc(1.5rem+var(--safe-bottom))]">
          <nav className="glass rounded-[2.5rem] shadow-2xl flex items-center justify-around h-16 border border-white/20">
            <button onClick={() => navigateTo('home')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentPage === 'home' ? 'text-primary' : 'text-zinc-500'}`}><span className={`material-symbols-outlined text-[28px] ${currentPage === 'home' ? 'filled' : ''}`}>home</span></button>
            <button onClick={() => navigateTo('events')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentPage === 'events' ? 'text-primary' : 'text-zinc-500'}`}><span className={`material-symbols-outlined text-[28px] ${currentPage === 'events' ? 'filled' : ''}`}>explore</span></button>
            <button onClick={() => navigateTo('certificates')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentPage === 'certificates' ? 'text-primary' : 'text-zinc-500'}`}><span className={`material-symbols-outlined text-[28px] ${currentPage === 'certificates' ? 'filled' : ''}`}>workspace_premium</span></button>
            <button onClick={() => navigateTo('profile')} className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentPage === 'profile' ? 'text-primary' : 'text-zinc-500'}`}><span className={`material-symbols-outlined text-[28px] ${currentPage === 'profile' ? 'filled' : ''}`}>person</span></button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
