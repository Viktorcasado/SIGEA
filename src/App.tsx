import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
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
import InstitutionPage from './pages/profile/InstitutionPage';
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
import AcessoRestritoPage from './pages/gestor/AcessoRestritoPage';
import GestorProtectedRoute from './components/GestorProtectedRoute';
import PoliciesPage from './pages/system/PoliciesPage';
import TermsPage from './pages/system/TermsPage';
import AboutPage from './pages/system/AboutPage';
import NotificationsPage from './pages/NotificationsPage';
import CreateEventPage from './pages/CreateEventPage';
import RestrictedAccessPage from './pages/RestrictedAccessPage';
import ProtectedRoute from './components/ProtectedRoute';
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
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </NotificationProvider>
    </UserProvider>
  );
}

function AppRoutes() {
  const { session, loading } = useUser();

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/validar-certificado" element={<ValidateCertificatePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/login" element={!session && !loading ? <LoginPage /> : (session ? <Navigate to="/" replace /> : <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>)} />
      <Route path="/register" element={!session && !loading ? <RegisterPage /> : (session ? <Navigate to="/" replace /> : <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>)} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="explorar" element={<ExplorePage />} />
        <Route path="evento/:id" element={<EventDetailPage />} />
        
        {/* Rotas que exigem login dentro do Layout principal */}
        <Route element={<ProtectedRoute allowedProfiles={['aluno', 'servidor', 'gestor', 'admin', 'comunidade_externa']} />}>
          <Route path="certificados" element={<CertificatesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="notificacoes" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Rotas Protegidas (Fora do Layout principal) */}
      <Route element={<ProtectedRoute allowedProfiles={['aluno', 'servidor', 'gestor', 'admin', 'comunidade_externa']} />}>
        <Route path="/perfil/editar" element={<EditProfilePage />} />
        <Route path="/perfil/instituicao-campus" element={<InstitutionPage />} />
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

        <Route element={<ProtectedRoute allowedProfiles={['servidor', 'gestor', 'admin', 'aluno']} />}>
          <Route path="/evento/criar" element={<div className='bg-gray-50 min-h-screen font-sans'><CreateEventPage /></div>} />
          <Route path="/evento/:id/cronograma" element={<div className='bg-gray-50 min-h-screen font-sans'><SchedulePage /></div>} />
          <Route path="/evento/:id/atividades" element={<div className='bg-gray-50 min-h-screen font-sans'><ManageActivitiesPage /></div>} />
          <Route path="/evento/:id/atividades/criar" element={<div className='bg-gray-50 min-h-screen font-sans'><ActivityFormPage /></div>} />
          <Route path="/evento/:id/atividades/:activityId/editar" element={<div className='bg-gray-50 min-h-screen font-sans'><ActivityFormPage /></div>} />
        </Route>
      </Route>

      <Route path="/gestor/acesso-restrito" element={<AcessoRestritoPage />} />
      <Route path="/acesso-restrito" element={<RestrictedAccessPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}