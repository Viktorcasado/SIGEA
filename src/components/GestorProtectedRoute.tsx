import { useUser } from '@/src/contexts/UserContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const GestorProtectedRoute = () => {
  const { user, session, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Se não houver sessão, manda para o login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se houver sessão mas o perfil ainda não carregou, espera
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Acesso liberado apenas para organizadores, gestores ou admins
  const hasAccess = user.is_organizer || user.perfil === 'gestor' || user.perfil === 'admin';

  if (!hasAccess) {
    return <Navigate to="/acesso-restrito" replace />;
  }

  return <Outlet />;
};

export default GestorProtectedRoute;