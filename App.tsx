
import React, { useState, useEffect } from 'react';
import { UserRole, Event } from './types.ts';
import { supabase } from './supabaseClient.ts';
import Home from './pages/Home.tsx';
import EventsList from './pages/EventsList.tsx';
import EventDetails from './pages/EventDetails.tsx';
import Registration from './pages/Registration.tsx';
import Certificates from './pages/Certificates.tsx';
import Profile from './pages/Profile.tsx';
import OrganizerDashboard from './pages/OrganizerDashboard.tsx';
import ManageEvent from './pages/ManageEvent.tsx';
import CheckIn from './pages/CheckIn.tsx';
import ParticipantsAdmin from './pages/ParticipantsAdmin.tsx';
import CreateEvent from './pages/CreateEvent.tsx';
import Reports from './pages/Reports.tsx';
import WhatsAppButton from './components/WhatsAppButton.tsx';
import Login from './pages/Login.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import ContactsSupport from './pages/ContactsSupport.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import { logActivity } from './utils/logger.ts';
import NotificationDrawer from './components/NotificationDrawer.tsx';

const SQL_SCRIPT = `DROP TABLE IF EXISTS public.registrations;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.events;

CREATE TABLE public.events (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text,
    campus text,
    date text,
    time text,
    location text,
    "imageUrl" text,
    "certificateTemplateUrl" text,
    type text,
    status text,
    price text,
    "certificateHours" integer,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    role text, 
    campus text,
    avatar_url text,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.registrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id text REFERENCES public.events(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    user_name text,
    user_email text,
    user_campus text,
    status text DEFAULT 'Pendente',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.certificates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id text REFERENCES public.events(id),
    event_title text,
    campus text,
    hours integer,
    issue_date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'Disponível'
);

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type text,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id text REFERENCES public.events(id) ON DELETE CASCADE,
    title text NOT NULL,
    time text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Público" ON public.events FOR SELECT USING (true);
CREATE POLICY "Gerenciar Eventos" ON public.events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso Público Perfis" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Atualizar Próprio Perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Acesso Inscrições" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Inserir Inscrições" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualizar Inscrições" ON public.registrations FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Ver Próprios Certificados" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin Gerir Certificados" ON public.certificates FOR ALL USING (auth.email() LIKE '%@ifal.edu.br');

CREATE POLICY "Ver Próprios Logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Inserir Logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Acesso Público Atividades" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Gerenciar Atividades" ON public.activities FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE public.activity_attendance (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(activity_id, user_id)
);

ALTER TABLE public.activity_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver Presença Atividades" ON public.activity_attendance FOR SELECT USING (true);
CREATE POLICY "Gerenciar Presença Atividades" ON public.activity_attendance FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    text text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver Próprias Notificações" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Atualizar Próprias Notificações" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Inserir Notificações" ON public.notifications FOR INSERT WITH CHECK (true);

-- Ativar bucket de avatars se não existir
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Avatares Públicos" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Upload de Avatares" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Deletar Próprios Avatares" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);`;

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('sigea_role');
    return (saved as UserRole) || UserRole.PARTICIPANT;
  });
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sigea_dark_mode') === 'true';
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tablesMissing, setTablesMissing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Usuário SIGEA',
    photo: 'https://lh3.googleusercontent.com/a/ACg8ocL_FmR_I_J870vM4g=s96-c',
    campus: 'Campus Maceió',
    email: ''
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sigea_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sigea_dark_mode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('sigea_role', role);
  }, [role]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        fetchProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
        fetchNotifications(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (!error) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      }
    } catch (err) { }
  };

  const addNotification = async (userId: string, title: string, text: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{ user_id: userId, title, text }])
        .select()
        .single();

      if (!error && data) {
        setNotifications(prev => [data, ...prev]);
      }
    } catch (err) { }
  };

  const fetchProfile = async (user: any) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      // Detecção Automática de Perfil por Domínio de E-mail
      const email = user.email || '';
      let detectedRole = UserRole.PARTICIPANT;

      if (email.endsWith('@ifal.edu.br')) {
        detectedRole = UserRole.ORGANIZER;
      } else if (email.endsWith('@aluno.ifal.edu.br')) {
        detectedRole = UserRole.PARTICIPANT;
      }

      // Prioriza a role do banco se existir, senão usa a detectada
      const finalRole = (data?.role as UserRole) || detectedRole;
      setRole(finalRole);

      if (data) {
        setUserProfile({
          name: data.full_name || user.user_metadata?.full_name || 'Usuário',
          photo: data.avatar_url || 'https://lh3.googleusercontent.com/a/ACg8ocL_FmR_I_J870vM4g=s96-c',
          campus: data.campus || 'Campus Maceió',
          email: email
        });
      }
    } catch (err) { }
  };

  useEffect(() => {
    if (session) fetchEvents();
  }, [session]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (error && (error.code === '42P01' || error.message.includes('not found'))) {
        setTablesMissing(true);
      } else if (data) {
        setEvents(data as Event[]);
        setTablesMissing(false);
      }
    } catch (err) {
      setTablesMissing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (newSession?: any) => {
    if (newSession) {
      setSession(newSession);
      if (newSession.user) {
        setUserProfile(prev => ({
          ...prev,
          name: newSession.user.user_metadata?.full_name || prev.name,
          email: newSession.user.email || ''
        }));
      }
    }
  };

  const navigateTo = (page: string, eventId: string | null = null) => {
    setCurrentPage(page);
    if (eventId !== null) setSelectedEventId(eventId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentPage('home');
  };

  const handleUpdateProfile = async (updatedData: any, newPhotoFile?: File) => {
    setIsLoading(true);
    try {
      let photoUrl = updatedData.photo;

      if (newPhotoFile && session?.user) {
        const fileExt = newPhotoFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, newPhotoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session?.user?.id,
          full_name: updatedData.name,
          avatar_url: photoUrl,
          // Garante persistência de e-mail e campus
          campus: updatedData.campus || 'Campus Maceió',
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      await logActivity(session.user.id, 'PROFILE_UPDATE', 'Perfil atualizado via App', { updatedData });

      setUserProfile(prev => ({ ...prev, ...updatedData, photo: photoUrl }));

      if (updateError) throw updateError;

      // Opcional: Atualizar e-mail (requer confirmação se habilitado no Supabase)
      if (updatedData.email !== userProfile.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: updatedData.email });
        if (emailError) console.warn("Erro ao atualizar e-mail:", emailError.message);
      }

      setUserProfile(prev => ({
        ...prev,
        name: updatedData.name,
        photo: photoUrl,
        email: updatedData.email
      }));

    } catch (err: any) {
      if (err.message?.includes('Bucket not found')) {
        alert("Erro: O bucket 'avatars' não foi encontrado no seu Supabase. Por favor, execute o script SQL de inicialização ou crie o bucket manualmente no Dashboard do Supabase (Storage > New Bucket > 'avatars' > Public).");
      } else {
        alert("Erro ao atualizar perfil: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  if (tablesMissing) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-background-dark p-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="size-24 bg-blue-100 dark:bg-blue-900/30 rounded-[2.5rem] flex items-center justify-center text-primary shadow-xl rotate-3">
          <span className="material-symbols-outlined text-5xl font-black">database</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Conexão Necessária</h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Não foi possível conectar ao banco de dados Supabase.</p>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(SQL_SCRIPT); alert("SQL Copiado!") }}
          className="w-full py-5 bg-primary text-white font-black rounded-[2rem] shadow-xl uppercase tracking-widest text-xs active:scale-95 transition-all"
        >
          Copiar Script SQL de Inicialização
        </button>
      </div>
    );
  }

  const handleAddEvent = async (newEvent: Event) => {
    setIsLoading(true);
    try {
      // Remove campos que não existem no banco ou ajusta
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ...eventData } = newEvent;

      const { error } = await supabase.from('events').insert([eventData]);

      if (error) throw error;

      await logActivity(session?.user?.id, 'CREATE_EVENT' as any, `Evento criado: ${newEvent.title}`, { eventId: newEvent.id });

      await fetchEvents(); // Recarrega a lista
    } catch (err: any) {
      console.error(err);
      alert('Erro ao publicar evento: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ...eventData } = updatedEvent;

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', updatedEvent.id);

      if (error) throw error;

      await logActivity(session?.user?.id, 'UPDATE_PROFILE' as any, `Evento atualizado: ${updatedEvent.title}`, { eventId: updatedEvent.id });

      await fetchEvents();
      navigateTo('manage-event', updatedEvent.id);
      alert('Evento atualizado com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao atualizar evento: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;

      await logActivity(session?.user?.id, 'DELETE_CERTIFICATE' as any, `Evento excluído: ${eventId}`, { eventId });

      await fetchEvents();
      navigateTo('home');
      alert('Evento excluído com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao excluir evento: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    const commonProps = {
      navigateTo,
      profile: userProfile,
      events,
      unreadNotifications: unreadCount,
      onNotify: () => setIsNotificationsOpen(true)
    };
    const selectedEvent = events.find(e => e.id === selectedEventId);

    if (role === UserRole.ORGANIZER) {
      switch (currentPage) {
        case 'home': return <OrganizerDashboard {...commonProps} />;
        case 'manage-event': return <ManageEvent navigateTo={navigateTo} eventId={selectedEventId} events={events} onDelete={handleDeleteEvent} onArchive={() => { }} />;
        case 'edit-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} eventToEdit={selectedEvent} />;
        case 'check-in': return <CheckIn navigateTo={navigateTo} events={events} />;
        case 'participants': return <ParticipantsAdmin navigateTo={navigateTo} eventId={selectedEventId} />;
        case 'certificates': return <Certificates navigateTo={navigateTo} isAdmin={true} events={events} />;
        case 'profile': return <Profile {...commonProps} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} darkMode={darkMode} setDarkMode={setDarkMode} role={role} onUpdate={handleUpdateProfile} onLogout={handleLogout} />;
        case 'create-event': return <CreateEvent navigateTo={navigateTo} onAddEvent={handleAddEvent} />;
        case 'reports': return <Reports navigateTo={navigateTo} />;
        case 'contacts': return <ContactsSupport navigateTo={navigateTo} />;
        case 'privacy': return <PrivacyPolicy navigateTo={navigateTo} />;
        default: return <OrganizerDashboard {...commonProps} />;
      }
    }

    switch (currentPage) {
      case 'home': return <Home {...commonProps} />;
      case 'events': return <EventsList navigateTo={navigateTo} events={events} />;
      case 'details': return <EventDetails navigateTo={navigateTo} eventId={selectedEventId} events={events} />;
      case 'register': return <Registration navigateTo={navigateTo} eventId={selectedEventId} events={events} user={session.user} addNotification={addNotification} />;
      case 'certificates': return <Certificates navigateTo={navigateTo} events={events} />;
      case 'profile': return <Profile {...commonProps} toggleRole={() => setRole(role === UserRole.PARTICIPANT ? UserRole.ORGANIZER : UserRole.PARTICIPANT)} darkMode={darkMode} setDarkMode={setDarkMode} role={role} onUpdate={handleUpdateProfile} onLogout={handleLogout} />;
      case 'contacts': return <ContactsSupport navigateTo={navigateTo} />;
      case 'privacy': return <PrivacyPolicy navigateTo={navigateTo} />;
      default: return <Home {...commonProps} />;
    }
  };

  useEffect(() => {
    (window as any).addNotification = addNotification;
  }, [addNotification]);

  const NavButton = ({ label, icon, page }: { label: string, icon: string, page: string }) => {
    const isActive = currentPage === page || (page === 'home' && role === UserRole.ORGANIZER && currentPage === 'dashboard');
    return (
      <button
        onClick={() => navigateTo(page)}
        className="flex flex-col items-center justify-center flex-1 h-full relative group"
      >
        <div className={`nav-pill mb-1 ${isActive ? 'active' : ''}`}>
          <span className={`material-symbols-outlined text-[26px] transition-all duration-300 ${isActive ? 'text-primary drop-shadow-md scale-110' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
            {icon}
          </span>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-tight transition-all duration-300 ${isActive ? 'text-primary translate-y-0 opacity-100' : 'text-slate-400 translate-y-1 opacity-70'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark max-w-md mx-auto relative border-x border-slate-200 dark:border-slate-800 transition-colors duration-500">
      <div className="page-content flex-1">
        {isLoading && (
          <div className="fixed inset-0 z-[60] bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {renderPage()}
      </div>

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
      />

      <div className="fixed-nav-container">
        <div className="dock-container">
          <nav className="nav-main liquid-glass w-full">
            <NavButton label="Início" icon="home" page="home" />
            <NavButton label="Eventos" icon="calendar_today" page="events" />

            {role === UserRole.ORGANIZER && (
              <button
                onClick={() => navigateTo('create-event')}
                className="fab-button -mt-8 mx-1 shrink-0"
              >
                <span className="material-symbols-outlined text-white text-3xl">add</span>
              </button>
            )}

            <NavButton label="Certificados" icon="workspace_premium" page="certificates" />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default App;
