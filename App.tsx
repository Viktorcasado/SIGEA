
import React, { useState, useEffect } from 'react';
import { UserRole, Event as SIGEAEvent } from './types.ts';
import { supabase, handleSupabaseError, uploadFile } from './supabaseClient.ts';
import { CAMPUS_LIST } from './constants.tsx';

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
import Schedule from './pages/Schedule.tsx';
import ParticipantsAdmin from './pages/ParticipantsAdmin.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import BottomNav from './components/BottomNav.tsx';
import Sidebar from './components/Sidebar.tsx';
import PortalBrowser from './components/PortalBrowser.tsx';

const ADMIN_EMAIL = 'viktorcasado@gmail.com';

const App: React.FC = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => localStorage.getItem('sigea_seen_welcome') === 'true');
  const [isHydrating, setIsHydrating] = useState(true);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePortal, setActivePortal] = useState<{ url: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<SIGEAEvent[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('sigea_theme') as any) || 'dark');

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const normalized = data.map(e => ({ ...e, imageUrl: e.image_url || e.imageUrl, certificateHours: e.certificate_hours || e.certificateHours }));
        setEvents(normalized);
        localStorage.setItem('sigea_offline_events', JSON.stringify(normalized));
      }
    } catch (err) {
      const cached = localStorage.getItem('sigea_offline_events');
      if (cached) setEvents(JSON.parse(cached));
    }
  };

  useEffect(() => {
    const initApp = async () => {
      // Prioridade: Detectar fluxo de redefinição de senha via Supabase Redirect
      if (window.location.hash.includes('type=recovery') || window.location.pathname.includes('/reset-password')) {
        setCurrentPage('reset-password');
        setIsHydrating(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        updateAuthState(session);
      } else {
        const cached = localStorage.getItem('sigea_local_profile');
        if (cached) {
          setUserProfile(JSON.parse(cached));
          setAuthStatus(true);
        } else {
          setAuthStatus(false);
        }
      }
      await fetchEvents();
      setIsHydrating(false);
    };
    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) updateAuthState(session);
      if (event === 'SIGNED_OUT') {
        localStorage.clear();
        setAuthStatus(false);
        setUserProfile(null);
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAuthState = (session: any) => {
    const user = session.user;
    const metadata = user.user_metadata || {};
    const profileData = { 
      id: user.id, 
      name: metadata.name || 'Usuário SIGEA', 
      email: user.email, 
      // Fix: CAMPUS_LIST is now imported and available
      campus: metadata.campus || CAMPUS_LIST[0], 
      photo: metadata.photo_url || '', 
      user_type: metadata.user_type || 'ALUNO' 
    };
    setUserProfile(profileData);
    localStorage.setItem('sigea_local_profile', JSON.stringify(profileData));
    const userRole = (user.email === ADMIN_EMAIL || metadata.role === 'ORGANIZER') ? UserRole.ORGANIZER : UserRole.PARTICIPANT;
    setRole(userRole);
    setAuthStatus(true);
  };

  const handleUpdateProfile = async (data: { name: string; campus: string; user_type?: string; imageFile?: File | null }) => {
    try {
      let photo_url = userProfile.photo;
      if (data.imageFile) {
        photo_url = await uploadFile('assets', `profiles/${userProfile.id}/${Date.now()}.png`, data.imageFile);
      }
      const { data: updateData, error } = await supabase.auth.updateUser({
        data: { name: data.name, campus: data.campus, user_type: data.user_type, photo_url: photo_url }
      });
      if (error) throw error;
      if (updateData.user) updateAuthState({ user: updateData.user });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: handleSupabaseError(err) };
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setAuthStatus(false);
    setUserProfile(null);
    setCurrentPage('home');
  };

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    if (id) setSelectedEventId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isHydrating) return (
    <div className="fixed inset-0 bg-white dark:bg-[#09090b] flex flex-col items-center justify-center">
      <div className="size-16 border-[5px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="mt-8 text-[11px] font-black text-primary uppercase tracking-[0.4em]">SIGEA Mobile v3.0</p>
    </div>
  );

  if (currentPage === 'reset-password') return <ResetPassword navigateTo={navigateTo} />;
  if (!hasSeenWelcome) return <Welcome onContinue={() => { localStorage.setItem('sigea_seen_welcome', 'true'); setHasSeenWelcome(true); }} />;
  if (!authStatus) return <Login onLogin={() => setAuthStatus(true)} onBack={() => setHasSeenWelcome(false)} darkMode={theme === 'dark'} setDarkMode={() => {}} />;

  const commonProps = { navigateTo, events, profile: userProfile, openPortal: (url: string, name: string) => setActivePortal({ url, name }), role, toggleSidebar: () => setIsSidebarOpen(true) };

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return role === UserRole.ORGANIZER ? <OrganizerDashboard {...commonProps} onNotify={() => {}} /> : <Home {...commonProps} onNotify={() => {}} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} role={role} />;
      case 'register': return <Registration {...commonProps} eventId={selectedEventId} onUpdateProfile={handleUpdateProfile} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} eventId={selectedEventId} user={userProfile} role={role} />;
      case 'profile': return <Profile {...commonProps} theme={theme} setTheme={setTheme} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={handleLogout} onDeleteAccount={async () => {}} onUpdate={handleUpdateProfile} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={fetchEvents} profile={userProfile} />;
      case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={fetchEvents} onArchive={() => {}} />;
      case 'check-in': return <CheckIn navigateTo={navigateTo} eventId={selectedEventId} />;
      case 'schedule': return <Schedule navigateTo={navigateTo} eventId={selectedEventId} role={role} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  return (
    <div className="flex flex-1 min-h-0 bg-slate-50 dark:bg-[#09090b]">
      {['home', 'events', 'certificates', 'profile'].includes(currentPage) && <Sidebar currentPage={currentPage} navigateTo={navigateTo} role={role} profile={userProfile} onLogout={handleLogout} openPortal={commonProps.openPortal} isOpenMobile={isSidebarOpen} setOpenMobile={setIsSidebarOpen} selectedEventId={selectedEventId} />}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-0 h-full">{renderContent()}</div>
        <BottomNav currentPage={currentPage} navigateTo={navigateTo} role={role} toggleSidebar={() => setIsSidebarOpen(true)} />
        <AIAssistant events={events} />
      </div>
      {activePortal && <PortalBrowser url={activePortal.url} name={activePortal.name} onClose={() => setActivePortal(null)} />}
    </div>
  );
};

export default App;
