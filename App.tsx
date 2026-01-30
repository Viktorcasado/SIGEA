import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import Layout from './components/Layout';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import MySubscriptionsScreen from './screens/MySubscriptionsScreen';
import HoursHistoryScreen from './screens/HoursHistoryScreen';
import CertificatesScreen from './screens/CertificatesScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyCredentialsScreen from './screens/MyCredentialsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SupportScreen from './screens/SupportScreen';
import ValidationScreen from './screens/ValidationScreen';
import Logo from './components/Logo';

const App: React.FC = () => {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0f172a] animate-fade">
        <Logo className="w-32 mb-8 animate-pulse" />
        <div className="w-8 h-8 border-4 border-ifal-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 font-black text-ifal-green uppercase tracking-[0.3em] text-[10px]">Sincronizando SIGEA</p>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="*" element={<AuthScreen />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/eventos" element={<EventsScreen onSelectEvent={() => {}} onNavigate={() => {}} />} />
            <Route path="/inscricoes" element={<MySubscriptionsScreen />} />
            <Route path="/historico" element={<HoursHistoryScreen />} />
            <Route path="/certificados" element={<CertificatesScreen onNavigate={() => {}} />} />
            <Route path="/perfil" element={<ProfileScreen userRole="participant" setUserRole={() => {}} onNavigate={() => {}} />} />
            <Route path="/perfil/editar" element={<EditProfileScreen onBack={() => window.history.back()} />} />
            <Route path="/credencial" element={<MyCredentialsScreen onBack={() => window.history.back()} />} />
            <Route path="/notificacoes" element={<NotificationsScreen onBack={() => window.history.back()} />} />
            <Route path="/suporte" element={<SupportScreen onBack={() => window.history.back()} />} />
            <Route path="/validar" element={<ValidationScreen onBack={() => window.history.back()} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </Router>
  );
};

export default App;