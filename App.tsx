
import React, { useState, useEffect } from 'react';
import { UserRole, Event as SIGEAEvent } from './types.ts';
import { supabase, handleSupabaseError } from './supabaseClient.ts';

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
import PublishSuccess from './pages/PublishSuccess.tsx';
import Welcome from './pages/Welcome.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import BottomNav from './components/BottomNav.tsx';

const App: React.FC = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    return localStorage.getItem('sigea_seen_welcome') === 'true';
  });
  
  const [isHydrating, setIsHydrating] = useState(true);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PARTICIPANT);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Função auxiliar para detectar se a URL atual é de recuperação de senha
  const isRecoveryRoute = () => {
    const hash = window.location.hash;
    const search = window.location.search;
    const path = window.location.pathname;
    return path.includes('reset-password') || 
           hash.includes('type=recovery') || 
           hash.includes('access_token') || 
           search.includes('type=recovery');
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

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [theme]);

  useEffect(() => {
    const initApp = async () => {
      // 1. Verifica sessão inicial
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        updateAuthState(session);
        // Se houver sessão mas estivermos em rota de recuperação, garantimos a página correta
        if (isRecoveryRoute()) {
          setCurrentPage('reset-password');
        }
      } else {
        setAuthStatus(false);
      }
      
      // 2. Carrega eventos
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setEvents(data || []);
      } catch (err: any) {
        setDbError(handleSupabaseError(err));
      } finally {
        setIsHydrating(false);
      }
    };

    initApp();

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        updateAuthState(session);
        // Evento específico disparado quando o usuário clica no link de recuperação
        if (event === 'PASSWORD_RECOVERY') {
          setCurrentPage('reset-password');
          localStorage.setItem('sigea_last_page', 'reset-password');
        }
      } else if (event === 'SIGNED_OUT') {
        handleLogoutCleanUp();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAuthState = (session: any) => {
    const metadata = session.user.user_metadata;
    setUserProfile({
      id: session.user.id,
      name: metadata?.name || 'Usuário SIGEA',
      email: session.user.email,
      campus: metadata?.campus || 'IFAL - Campus Maceió',
      photo: metadata?.photo_url || ''
    });
    setRole((metadata?.role || UserRole.PARTICIPANT) as UserRole);
    setAuthStatus(true);
  };

  const handleLogoutCleanUp = () => {
    setAuthStatus(false);
    setUserProfile(null);
    localStorage.removeItem('sigea-auth-token');
    localStorage.removeItem('sigea_last_page');
    localStorage.removeItem('sigea_last_event_id');
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao sair:", error);
    } finally {
      handleLogoutCleanUp();
    }
  };

  const handleDeleteAccount = async () => {
    if (!userProfile?.id) return;
    try {
      await supabase.from('registrations').delete().eq('user_id', userProfile.id);
      await handleLogout();
    } catch (err) {
      alert("Erro ao excluir dados.");
    }
  };

  const navigateTo = (page: string, id: string | null = null) => {
    setCurrentPage(page);
    setSelectedEventId(id);
    localStorage.setItem('sigea_last_page', page);
    if (id) localStorage.setItem('sigea_last_event_id', id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isHydrating) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center">
        <div className="size-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-6 text-[10px] font-black text-primary uppercase tracking-[0.4em]">Sincronizando SIGEA...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center p-10 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-6">database_off</span>
        <h2 className="text-white text-xl font-black uppercase mb-4">Erro de Sincronização</h2>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed max-w-xs">{dbError}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-primary text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">Recarregar App</button>
      </div>
    );
  }

  if (!hasSeenWelcome) return <Welcome onContinue={() => { localStorage.setItem('sigea_seen_welcome', 'true'); setHasSeenWelcome(true); }} />;
  
  // LOGICA CRÍTICA: Se não estiver logado E não for rota de recuperação, mostra login.
  // Se for rota de recuperação, o authStatus pode ser true (logado temporariamente pelo token) ou false,
  // mas devemos mostrar o ResetPassword.
  if (!authStatus && currentPage !== 'reset-password') {
    return <Login onLogin={() => setAuthStatus(true)} onBack={() => setHasSeenWelcome(false)} darkMode={theme === 'dark'} setDarkMode={() => {}} />;
  }

  const commonProps = { navigateTo, events, profile: userProfile };

  const renderContent = () => {
    // Força o ResetPassword se a rota for detectada, independente do estado do authStatus
    if (currentPage === 'reset-password') return <ResetPassword navigateTo={navigateTo} />;

    switch (currentPage) {
      case 'home': return role === UserRole.ORGANIZER ? <OrganizerDashboard {...commonProps} onNotify={() => {}} /> : <Home {...commonProps} onNotify={() => {}} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} role={role} />;
      case 'register': return <Registration {...commonProps} eventId={selectedEventId} onUpdateProfile={async (data) => {
        const { error } = await supabase.auth.updateUser({ data });
        if (!error) {
          setUserProfile((prev: any) => ({...prev, ...data}));
          return true;
        }
        return false;
      }} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} events={events} />;
      case 'profile': return <Profile {...commonProps} theme={theme} setTheme={setTheme} role={role} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} onUpdate={async (data) => {
        const { error } = await supabase.auth.updateUser({ data });
        if (!error) {
          setUserProfile((prev: any) => ({...prev, ...data}));
          return true;
        }
        return false;
      }} />;
      case 'ticket': return <MyTicket navigateTo={navigateTo} profile={userProfile} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={(ev) => setEvents([ev, ...events])} />;
      case 'publish-success': return <PublishSuccess navigateTo={navigateTo} event={events.find(e => e.id === selectedEventId) || events[0]} />;
      default: return <Home {...commonProps} onNotify={() => {}} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b]">
      <main className="flex-1 pb-24">{renderContent()}</main>
      <BottomNav currentPage={currentPage} navigateTo={navigateTo} role={role} />
      <AIAssistant events={events} />
    </div>
  );
};

export default App;
