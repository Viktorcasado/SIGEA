import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginGovBrPage from './pages/LoginGovBrPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CertificatesPage from './pages/CertificatesPage';
import ValidateCertificatePage from './pages/ValidateCertificatePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import InstitutionPage from './pages/profile/InstitutionPage';
import DocumentsPage from './pages/profile/DocumentsPage';
import SecurityPage from './pages/profile/SecurityPage';
import UserInscriptionsPage from './pages/profile/UserInscriptionsPage';
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
import EventDetailPage from './pages/EventDetailPage';
import RestrictedAccessPage from './pages/RestrictedAccessPage';
import ProtectedRoute from './components/ProtectedRoute';
import SchedulePage from './pages/event/SchedulePage';
import ManageActivitiesPage from './pages/event/ManageActivitiesPage';
import ActivityFormPage from './pages/event/ActivityFormPage';
import MarkPresencePage from './pages/event/MarkPresencePage';
import { Loader2 } from 'lucide-react';

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </UserProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-4xl font-black text-gray-900 tracking-tighter mb-8">
          SIGEA<span className="text-indigo-600">.</span>
        </div>
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Carregando sistema...</p>
      </div>
    );
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/login-govbr" element={<LoginGovBrPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="explorar" element={<ExplorePage />} />
            <Route path="certificados" element={<CertificatesPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/perfil/editar" element={<EditProfilePage />} />
          <Route path="/perfil/instituicao-campus" element={<InstitutionPage />} />
          <Route path="/perfil/documentos" element={<DocumentsPage />} />
          <Route path="/perfil/seguranca" element={<SecurityPage />} />
          <Route path="/perfil/eventos-inscritos" element={<div className='bg-gray-50 min-h-screen'><UserInscriptionsPage /></div>} />
          <Route path="/sistema/politicas" element={<PoliciesPage />} />
          <Route path="/sistema/termos" element={<TermsPage />} />
          <Route path="/sistema/sobre" element={<AboutPage />} />
          <Route path="/gestor/acesso-restrito" element={<AcessoRestritoPage />} />
          <Route element={<GestorProtectedRoute />}>
            <Route path="/gestor" element={<GestorLayout />}>
              <Route path="painel" element={<PainelPage />} />
              <Route path="eventos" element={<GestorEventosPage />} />
              <Route path="vinculos" element={<GestorVinculosPage />} />
              <Route path="relatorios" element={<GestorRelatoriosPage />} />
              <Route path="auditoria" element={<GestorAuditoriaPage />} />
            </Route>
          </Route>
          <Route path="/evento/:id" element={<div className='bg-gray-50 min-h-screen'><div className='max-w-4xl mx-auto p-4'><EventDetailPage /></div></div>} />
          <Route path="/notificacoes" element={<NotificationsPage />} />
          <Route path="/validar-certificado" element={<ValidateCertificatePage />} />
          <Route path="/acesso-restrito" element={<RestrictedAccessPage />} />
          <Route element={<ProtectedRoute allowedProfiles={['servidor', 'gestor', 'admin']} />}>
            <Route path="/evento/criar" element={<div className='bg-gray-50 min-h-screen'><CreateEventPage /></div>} />
            <Route path="/evento/:id/cronograma" element={<div className='bg-gray-50 min-h-screen'><SchedulePage /></div>} />
            <Route path="/evento/:id/atividades" element={<div className='bg-gray-50 min-h-screen'><ManageActivitiesPage /></div>} />
            <Route path="/evento/:id/atividades/criar" element={<div className='bg-gray-50 min-h-screen'><ActivityFormPage /></div>} />
            <Route path="/evento/:id/atividades/:activityId/editar" element={<div className='bg-gray-50 min-h-screen'><ActivityFormPage /></div>} />
            <Route path="/evento/:id/atividades/:activityId/presenca" element={<div className='bg-gray-50 min-h-screen'><MarkPresencePage /></div>} />
          </Route>
        </>
      )}
    </Routes>
  );
}