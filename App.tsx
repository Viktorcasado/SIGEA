
import React, { useState, useEffect } from 'react';
import { UserRole, Event as SIGEAEvent } from './types.ts';
import { supabase, handleSupabaseError, uploadFile } from './supabaseClient.ts';

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

const ADMIN_EMAIL = 'viktorcasado@gmail.com';

const App: React.FC = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    return localStorage.getItem('sigea_seen_welcome') === 'true';
  });
  
  const [isHydrating, setIsHydrating] = useState(true);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  
  const [userProfile, setUserProfile] = useState<any>(() => {
    const saved = localStorage.getItem('sigea_local_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('sigea_local_role') as UserRole) || UserRole.PARTICIPANT;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePortal, setActivePortal] = useState<{ url: string; name: string } | null>(null);
  
  const isResetFlow = () => {
    return window.location.pathname.includes('reset-password') || window.location.hash.includes('type=recovery');
  };

  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (isResetFlow()) return 'reset-password';
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
        localStorage.setItem('sigea_cached_events', JSON.stringify(normalizedEvents));
      }
    } catch (err) {
      const cached = localStorage.getItem('sigea_cached_events');
      if (cached) setEvents(JSON.parse(cached));
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    localStorage.setItem('sigea_theme', theme);
  }, [theme]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          updateAuthState(session);
        } else if (userProfile) {
          setAuthStatus(true);
        } else {
          setAuthStatus(false);
        }
        await fetchEvents();
      } catch (err) {
        setAuthStatus(userProfile !== null);
      } finally {
        setIsHydrating(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        updateAuthState(session);
      } else if (event === 'SIGNED_OUT') {
        setAuthStatus(false);
        setUserProfile(null);
        localStorage.removeItem('sigea_local_profile');
        localStorage.removeItem('sigea_local_role');
        localStorage.removeItem('sigea_cached_events');
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAuthState = (sessionOrUser: any) => {
    const user = sessionOrUser.user || sessionOrUser;
    if (!user) return;

    const metadata = user.user_metadata || {};
    const email = user.email || userProfile?.email || '';
    
    const profileData = {
      id: user.id,
      name: metadata.name || 'Usuário SIGEA',
      email: email,
      campus: metadata.campus || 'IFAL - Campus Maceió',
      photo: metadata.photo_url || metadata.photo || ''
    };
    
    setUserProfile(profileData);
    localStorage.setItem('sigea_local_profile', JSON.stringify(profileData));
    
    let userRole = (metadata.role || UserRole.PARTICIPANT) as UserRole;
    if (email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      userRole = UserRole.ORGANIZER;
    }
    
    const localRole = localStorage.getItem('sigea_local_role') as UserRole;
    if (localRole) {
      setRole(localRole);
    } else {
      setRole(userRole);
      localStorage.setItem('sigea_local_role', userRole);
    }
    
    setAuthStatus(true);
  };

  const handleUpdateProfile = async (data: { name: string; campus: string; imageFile?: File | null }) => {
    const updatedProfile = { ...userProfile, name: data.name, campus: data.campus };
    setUserProfile(updatedProfile);
    localStorage.setItem('sigea_local_profile', JSON.stringify(updatedProfile));

    try {
      let photo_url = userProfile.photo;

      if (data.imageFile) {
        try {
          const fileExt = data.imageFile.name.split('.').pop();
          const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;
          const filePath = `profiles/${userProfile.id}/${fileName}`;
          photo_url = await uploadFile('assets', filePath, data.imageFile);
          
          const profileWithPhoto = { ...updatedProfile, photo: photo_url };
          setUserProfile(profileWithPhoto);
          localStorage.setItem('sigea_local_profile', JSON.stringify(profileWithPhoto));
        } catch (e) {
          console.warn("Upload falhou, salvando localmente");
        }
      }

      const { data: updateData, error } = await supabase.auth.updateUser({
        data: { 
          name: data.name, 
          campus: data.campus,
          photo_url: photo_url 
        }
      });

      if (error) throw error;
      if (updateData.user) updateAuthState(updateData.user);
      return { success: true };
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('failed to fetch') || msg.includes('network error') || msg.includes('typeerror')) {
        return { success: true, localOnly: true };
      }
      return { success: false, error: handleSupabaseError(err) };
    }
  };

  const handleToggleRole = async () => {
    const newRole = role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT;
    
    setRole(newRole);
    localStorage.setItem('sigea_local_role', newRole);

    try {
      const { data: updateData, error } = await supabase.auth.updateUser({
        data: { role: newRole }
      });
      if (error) throw error;
      if (updateData.user) updateAuthState(updateData.user);
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || '';
      if (!msg.includes('failed to fetch') && !msg.includes('network error')) {
        alert(handleSupabaseError(err));
      }
    }
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
    try {
      await supabase.auth.signOut();
    } catch (e) {
      setAuthStatus(false);
      setUserProfile(null);
      localStorage.clear();
      setCurrentPage('login');
    }
  };

  if (isHydrating) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center">
        <div className="size-16 border-[5px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-8 text-[11px] font-black text-primary uppercase tracking-[0.5em]">SIGEA Mobile</p>
      </div>
    );
  }

  if (!hasSeenWelcome && !isResetFlow()) return <Welcome onContinue={() => { localStorage.setItem('sigea_seen_welcome', 'true'); setHasSeenWelcome(true); }} />;
  
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
      case 'certificates': return <Certificates navigateTo={navigateTo} eventId={selectedEventId} user={userProfile} role={role} />;
      case 'profile': return (
        <Profile 
          {...commonProps} 
          theme={theme} 
          setTheme={setTheme} 
          role={role} 
          toggleRole={handleToggleRole} 
          onLogout={handleLogout} 
          onDeleteAccount={async () => {}} 
          onUpdate={handleUpdateProfile} 
        />
      );
      case 'ticket': return <MyTicket navigateTo={navigateTo} profile={userProfile} event={events.find(e => e.id === selectedEventId)} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={fetchEvents} profile={userProfile} />;
      case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={fetchEvents} onArchive={() => {}} />;
      case 'publish-success': return <PublishSuccess navigateTo={navigateTo} event={events.find(e => e.id === selectedEventId)} />;
      case 'integrations': return <Integrations {...commonProps} />;
      case 'help': return <Help navigateTo={navigateTo} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} eventId={selectedEventId} />;
      case 'schedule': return <Schedule navigateTo={navigateTo} eventId={selectedEventId} role={role} />;
      case 'participants': return <ParticipantsAdmin navigateTo={navigateTo} eventId={selectedEventId || undefined} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  const isNavigationVisible = ['home', 'events', 'certificates', 'profile', 'integrations', 'help'].includes(currentPage);

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
          selectedEventId={selectedEventId}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-0">
          {renderContent()}
        </div>
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
