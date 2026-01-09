
import React, { useState, useEffect } from 'react';
import { UserRole, Event as SIGEAEvent } from './types.ts';
import { supabase, uploadFile, handleSupabaseError } from './supabaseClient.ts';

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
import EditEvent from './pages/EditEvent.tsx';
import ManageEvent from './pages/ManageEvent.tsx';
import CheckIn from './pages/CheckIn.tsx';
import PublishSuccess from './pages/PublishSuccess.tsx';
import Welcome from './pages/Welcome.tsx';
import Reports from './pages/Reports.tsx';
import Integrations from './pages/Integrations.tsx';
import Schedule from './pages/Schedule.tsx';
import ParticipantsAdmin from './pages/ParticipantsAdmin.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import BottomNav from './components/BottomNav.tsx';
import Sidebar from './components/Sidebar.tsx';
import PortalBrowser from './components/PortalBrowser.tsx';

const App: React.FC = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    return localStorage.getItem('sigea_seen_welcome') === 'true';
  });
  
  const [isHydrating, setIsHydrating] = useState(true);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  const [activePortal, setActivePortal] = useState<{ url: string; name: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
        const normalizedEvents = data.map(e => ({
          ...e,
          imageUrl: e.image_url || e.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000',
          certificateHours: e.certificate_hours || e.certificateHours || 0
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
        if (event === 'SIGNED_IN') {
          if (currentPage === 'home' || !localStorage.getItem('sigea_last_page')) {
            setCurrentPage('home');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        handleLogoutCleanUp();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAuthState = (session: any) => {
    const metadata = session.user.user_metadata;
    const userEmail = session.user.email?.toLowerCase();
    const isAdmin = userEmail === 'viktorcasado@gmail.com';

    const profileData = {
      id: session.user.id,
      name: metadata?.name || (isAdmin ? 'Viktor Casado' : 'Usuário SIGEA'),
      email: session.user.email,
      campus: metadata?.campus || 'IFAL - Campus Maceió',
      photo: metadata?.photo_url || metadata?.photo || ''
    };
    setUserProfile(profileData);
    setRole((isAdmin ? UserRole.ORGANIZER : (metadata?.role || UserRole.PARTICIPANT)) as UserRole);
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

  const openPortal = (url: string, name: string) => {
    setActivePortal({ url, name });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      // 1. Forçar refresh da sessão para evitar erro de conexão por JWT expirado
      await supabase.auth.refreshSession();
      
      let finalPhotoUrl = userProfile?.photo;

      // 2. Upload real se houver arquivo
      if (data.imageFile) {
        const fileExt = data.imageFile.name.split('.').pop();
        const fileName = `avatar-${userProfile.id}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${userProfile.id}/${fileName}`;
        try {
          // Fix: Declaring finalImageUrl with const to resolve scope error
          const finalImageUrl = await uploadFile('assets', filePath, data.imageFile);
          finalPhotoUrl = finalImageUrl;
        } catch (uploadErr: any) {
          return { success: false, error: uploadErr.message };
        }
      }

      // 3. Atualizar Metadata
      const updateData = {
        name: data.name || userProfile.name,
        campus: data.campus || userProfile.campus,
        photo_url: finalPhotoUrl,
        photo: finalPhotoUrl
      };

      const { error } = await supabase.auth.updateUser({ data: updateData });
      
      if (error) throw error;

      setUserProfile((prev: any) => ({ ...prev, ...updateData }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: handleSupabaseError(err) };
    }
  };

  const toggleRole = async () => {
    const newRole = role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT;
    setRole(newRole);
    try {
      await supabase.auth.updateUser({ data: { role: newRole } });
    } catch (err) {
      console.error("Erro ao persistir role:", err);
    }
  };

  const handleRefreshEvents = async () => {
    await fetchEvents();
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

  const commonProps = { navigateTo, events, profile: userProfile, openPortal, role, toggleSidebar: () => setIsSidebarOpen(true) };

  const renderContent = () => {
    if (currentPage === 'reset-password') return <ResetPassword navigateTo={navigateTo} />;

    switch (currentPage) {
      case 'home': return role === UserRole.ORGANIZER ? <OrganizerDashboard {...commonProps} onNotify={() => {}} /> : <Home {...commonProps} onNotify={() => {}} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} role={role} />;
      case 'register': return <Registration {...commonProps} eventId={selectedEventId} onUpdateProfile={handleUpdateProfile} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} eventId={selectedEventId} events={events} user={userProfile} role={role} />;
      case 'profile': return (
        <Profile 
          {...commonProps} 
          theme={theme} 
          setTheme={setTheme} 
          role={role} 
          toggleRole={toggleRole} 
          onLogout={handleLogout} 
          onDeleteAccount={async () => {}} 
          onUpdate={handleUpdateProfile} 
        />
      );
      case 'ticket': 
        const ticketEvent = events.find(e => e.id === selectedEventId);
        return <MyTicket navigateTo={navigateTo} profile={userProfile} event={ticketEvent} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={handleRefreshEvents} profile={userProfile} />;
      case 'edit-event': return <EditEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onUpdate={handleRefreshEvents} />;
      case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={() => fetchEvents()} onArchive={() => {}} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} eventId={selectedEventId} />;
      case 'schedule': return <Schedule navigateTo={navigateTo} eventId={selectedEventId} role={role} />;
      case 'participants': return <ParticipantsAdmin navigateTo={navigateTo} eventId={selectedEventId || undefined} />;
      case 'publish-success': 
        const successEvent = events.find(e => e.id === selectedEventId);
        return <PublishSuccess navigateTo={navigateTo} event={successEvent} />;
      case 'reports': return <Reports navigateTo={navigateTo} />;
      case 'integrations': return <Integrations {...commonProps} />;
      case 'help': return <Help navigateTo={navigateTo} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  const isNavigationVisible = ['home', 'events', 'certificates', 'profile', 'reports', 'help', 'create-event', 'edit-event', 'check-in', 'integrations', 'schedule', 'participants'].includes(currentPage);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#09090b]">
      {isNavigationVisible && (
        <Sidebar 
          currentPage={currentPage} 
          navigateTo={navigateTo} 
          role={role} 
          profile={userProfile} 
          onLogout={handleLogout}
          openPortal={openPortal}
          isOpenMobile={isSidebarOpen}
          setOpenMobile={setIsSidebarOpen}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <main className="flex-1 pb-24 lg:pb-0">{renderContent()}</main>
        <BottomNav 
          currentPage={currentPage} 
          navigateTo={navigateTo} 
          role={role} 
          toggleSidebar={() => setIsSidebarOpen(true)}
        />
        <AIAssistant events={events} />
      </div>

      {activePortal && (
        <PortalBrowser 
          url={activePortal.url} 
          name={activePortal.name} 
          onClose={() => setActivePortal(null)} 
        />
      )}
    </div>
  );
};

export default App;
