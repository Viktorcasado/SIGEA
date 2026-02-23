import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CertificatesPage from './pages/CertificatesPage';
import ValidateCertificatePage from './pages/ValidateCertificatePage';
import EventDetailPage from './pages/EventDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import SecurityPage from './pages/profile/SecurityPage';
import AppSettingsPage from './pages/profile/AppSettingsPage';
import UserInscriptionsPage from './pages/profile/UserInscriptionsPage';
import UserPresencesPage from './pages/profile/UserPresencesPage';
import MyEventsPage from './pages/profile/MyEventsPage';
import InscritosPage from './pages/profile/InscritosPage';
import MarcarPresencaPage from './pages/profile/MarcarPresencaPage';
import GestorLayout from './pages/gestor/GestorLayout';
import PainelPage from './pages/gestor/PainelPage';
import GestorEventosPage from './pages/gestor/GestorEventosPage';
import GestorVinculosPage from './pages/gestor/GestorVinculosPage';
import GestorRelatoriosPage from './pages/gestor/GestorRelatoriosPage';
import GestorAuditoriaPage from './pages/gestor/GestorAuditoriaPage';
import GestorProtectedRoute from './components/GestorProtectedRoute';
import PoliciesPage from './pages/system/PoliciesPage';
import TermsPage from './pages/system/TermsPage';
import AboutPage from './pages/system/AboutPage';
import NotificationsPage from './pages/NotificationsPage';
import CreateEventPage from './pages/CreateEventPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import SchedulePage from './pages/event/SchedulePage';
import ManageActivitiesPage from './pages/event/ManageActivitiesPage';
import ActivityFormPage from './pages/event/ActivityFormPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import CertificateTemplatePage from './pages/gestor/CertificateTemplatePage';
import CertificateEditorPage from './pages/gestor/CertificateEditorPage';

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <ToastProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </ToastProvider>
      </NotificationProvider>
    </UserProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas de Sistema */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/validar-certificado" element={<ValidateCertificatePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Rotas que redirecionam se logado */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Layout Principal */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="explorar" element={<ExplorePage />} />
        <Route path="evento/:id" element={<EventDetailPage />} />
        
        {/* Rotas Protegidas dentro do Layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="certificados" element={<CertificatesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="notificacoes" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Rotas Protegidas Fora do Layout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/perfil/editar" element={<EditProfilePage />} />
        <Route path="/perfil/seguranca" element={<SecurityPage />} />
        <Route path="/perfil/configuracoes" element={<AppSettingsPage />} />
        <Route path="/perfil/eventos-inscritos" element={<div className='bg-gray-50 min-h-screen font-sans'><UserInscriptionsPage /></div>} />
        <Route path="/perfil/presencas" element={<div className='bg-gray-50 min-h-screen font-sans'><UserPresencesPage /></div>} />
        <Route path="/perfil/meus-eventos" element={<div className='bg-gray-50 min-h-screen font-sans'><MyEventsPage /></div>} />
        <Route path="/perfil/inscritos" element={<div className='bg-gray-50 min-h-screen font-sans'><InscritosPage /></div>} />
        <Route path="/perfil/marcar-presenca" element={<div className='bg-gray-50 min-h-screen font-sans'><MarcarPresencaPage /></div>} />
        
        <Route path="/sistema/politicas" element={<PoliciesPage />} />
        <Route path="/sistema/termos" element={<TermsPage />} />
        <Route path="/sistema/sobre" element={<AboutPage />} />

        <Route element={<GestorProtectedRoute />}>
          <Route path="/gestor" element={<GestorLayout />}>
            <Route path="painel" element={<PainelPage />} />
            <Route path="eventos" element={<GestorEventosPage />} />
            <Route path="vinculos" element={<GestorVinculosPage />} />
            <Route path="relatorios" element={<GestorRelatoriosPage />} />
            <Route path="auditoria" element={<GestorAuditoriaPage />} />
            <Route path="eventos/:id/certificado-template" element={<CertificateTemplatePage />} />
            <Route path="eventos/:id/certificado-template/editor" element={<CertificateEditorPage />} />
          </Route>
        </Route>

        <Route path="/evento/criar" element={<div className='bg-gray-50 min-h-screen font-sans'><CreateEventPage /></div>} />
        <Route path="/evento/:id/cronograma" element={<div className='bg-gray-50 min-h-screen font-sans'><SchedulePage /></div>} />
        <Route path="/evento/:id/atividades" element={<div className='bg-gray-50 min-h-screen font-sans'><ManageActivitiesPage /></div>} />
        <Route path="/evento/:id/atividades/criar" element={<div className='bg-gray-50 min-h-screen font-sans'><ActivityFormPage /></div>} />
        <Route path="/evento/:id/atividades/:activityId/editar" element={<div className='bg-gray-50 min-h-screen font-sans'><ActivityFormPage /></div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}