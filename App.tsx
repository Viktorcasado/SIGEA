import React, { useState, useEffect } from 'react';
import BottomNavBar from './components/BottomNavBar';
import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import CertificatesScreen from './screens/CertificatesScreen';
import ProfileScreen from './screens/ProfileScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import ManageAttendeesScreen from './screens/ManageAttendeesScreen';
import SecurityScreen from './screens/SecurityScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ValidationScreen from './screens/ValidationScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import MySubscriptionsScreen from './screens/MySubscriptionsScreen';
import HoursHistoryScreen from './screens/HoursHistoryScreen';
import SupportScreen from './screens/SupportScreen';
import { Event, Activity } from './types';
import { useUser } from './contexts/UserContext';
import Icon from './components/Icon';
import { supabase } from './services/supabaseClient';
import FloatingActionButton from './components/FloatingActionButton';
import AIAssistantModal from './components/AIAssistantModal';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import CredentialScannerScreen from './screens/CredentialScannerScreen';
import AddActivityScreen from './screens/AddActivityScreen';
import AuthenticationFlow from './screens/AuthenticationFlow';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';

export type UserRole = 'participant' | 'organizer';
type MainTabs = 'home' | 'events' | 'certificates' | 'profile';

const App: React.FC = () => {
  const { user, loading, error } = useUser();
  const [activeTab, setActiveTab] = useState<MainTabs>('home');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('participant');
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [isSplashing, setIsSplashing] = useState(true);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.matchMedia('(min-width: 768px)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleResize = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    setActiveSubScreen('Editar Evento');
  };

  const handleEditActivity = (activity: Activity) => {
    setActivityToEdit(activity);
    setActiveSubScreen('Adicionar Atividade');
  };

  const handleBack = () => {
    setSelectedEvent(null);
    setEventToEdit(null);
    setActivityToEdit(null);
    setActiveSubScreen(null);
  };
  
  const navigateTo = (screenTitle: string) => {
    setActiveSubScreen(screenTitle);
  }

  const renderContent = () => {
    if (activeSubScreen) {
        switch (activeSubScreen) {
            case 'Editar Perfil': return <EditProfileScreen onBack={handleBack} />;
            case 'Segurança': return <SecurityScreen onBack={handleBack} />;
            case 'Minhas Inscrições': return <MySubscriptionsScreen onBack={handleBack} />;
            case 'Histórico de Horas': return <HoursHistoryScreen onBack={handleBack} />;
            case 'Notificações': return <NotificationsScreen onBack={handleBack} />;
            case 'Central de Suporte': return <SupportScreen onBack={handleBack} />;
            case 'Validar Certificado': return <ValidationScreen onBack={handleBack} />;
            case 'Escanear Credencial':
                if (!selectedEvent) return <AdminDashboardScreen onSelectEvent={handleSelectEvent} onNavigate={navigateTo} onEditEvent={handleEditEvent} />;
                return <CredentialScannerScreen event={selectedEvent} onBack={handleBack} />;
            case 'Criar Novo Evento': return <CreateEventScreen onBack={handleBack} />;
            case 'Adicionar Atividade':
                if (!selectedEvent) return <AdminDashboardScreen onSelectEvent={handleSelectEvent} onNavigate={navigateTo} onEditEvent={handleEditEvent} />;
                return <AddActivityScreen onBack={handleBack} eventId={selectedEvent.id} activityToEdit={activityToEdit} />;
            case 'Editar Evento': return <CreateEventScreen onBack={handleBack} eventToEdit={eventToEdit} />;
            default: return <EditProfileScreen onBack={handleBack} />;
        }
    }
    if (selectedEvent) {
      if (userRole === 'organizer') {
        return <ManageAttendeesScreen event={selectedEvent} onBack={handleBack} onNavigate={navigateTo} onEditActivity={handleEditActivity} onEditEvent={handleEditEvent} isDesktop={isDesktop} />;
      }
      return <EventDetailScreen event={selectedEvent} onBack={handleBack} />;
    }

    return (
      <div className="animate-fade-in">
        <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
            {userRole === 'organizer' ? (
                <AdminDashboardScreen onSelectEvent={handleSelectEvent} onNavigate={navigateTo} onEditEvent={handleEditEvent} />
            ) : (
                <HomeScreen onSelectEvent={handleSelectEvent} onNavigate={navigateTo} />
            )}
        </div>
        <div style={{ display: activeTab === 'events' ? 'block' : 'none' }}>
            <EventsScreen onSelectEvent={handleSelectEvent} onNavigate={navigateTo} />
        </div>
        <div style={{ display: activeTab === 'certificates' ? 'block' : 'none' }}>
            <CertificatesScreen onNavigate={navigateTo} />
        </div>
        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
             <ProfileScreen userRole={userRole} setUserRole={setUserRole} onNavigate={navigateTo} />
        </div>
      </div>
    );
  };

  if (isSplashing) {
    return (
        <div className="flex justify-center items-center h-screen bg-black animate-fade-out">
            <Logo className="w-48" />
        </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F2F2F7] dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ifal-green"></div>
      </div>
    );
  }
  
  if (error) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-[#F2F2F7] dark:bg-[#121212] p-6 text-center">
            <Icon name="life-buoy" className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Ops! Algo deu errado.</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm">
                Não foi possível carregar as informações. Verifique sua conexão ou tente novamente.
            </p>
            <button onClick={() => window.location.reload()} className="mt-8 bg-ifal-green text-white font-semibold py-3 px-8 rounded-xl hover:bg-emerald-600 transition-colors">
                Tentar Novamente
            </button>
        </div>
    )
  }

  if (!user) {
    return <AuthenticationFlow />;
  }
  
  if (isDesktop) {
    return (
      <div className="h-screen w-screen flex font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F8FA] dark:bg-black">
          <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-gray-900 border-b border-black/5 dark:border-white/5 z-20">
             <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
                {activeSubScreen || (activeTab === 'home' ? 'Painel de Controle' : activeTab)}
             </h2>
             <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="px-4 py-2 bg-ifal-green/10 text-ifal-green rounded-full text-xs font-black uppercase tracking-widest flex items-center space-x-2 hover:bg-ifal-green/20 transition-all"
                >
                   <Icon name="sparkles" className="w-4 h-4" />
                   <span>Nayara AI</span>
                </button>
                <div className="w-px h-6 bg-black/5 dark:bg-white/5" />
                <MainHeader onNavigate={navigateTo} />
             </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8 max-w-[1200px] mx-auto w-full">
            {renderContent()}
          </main>
        </div>
        <AIAssistantModal isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
      </div>
    );
  }

  const showNavBar = !selectedEvent && !activeSubScreen;
  const showFab = showNavBar && userRole === 'participant';

  return (
    <div className="min-h-screen font-sans text-gray-900 dark:text-gray-100">
      <div className="pb-24">
        {renderContent()}
      </div>
      {showNavBar && <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />}
      {showFab && <FloatingActionButton onClick={() => setIsAIAssistantOpen(true)} />}
      <AIAssistantModal isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
    </div>
  );
};

export default App;