import { useUser } from '@/src/contexts/UserContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedProfiles: Array<'aluno' | 'servidor' | 'gestor' | 'admin' | 'comunidade_externa'>;
}

const ProtectedRoute = ({ allowedProfiles }: ProtectedRouteProps) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não estiver logado, vai para o login em vez de "Acesso Restrito"
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se estiver logado mas o perfil não estiver na lista (raro, pois a lista cobre quase tudo)
  if (!allowedProfiles.includes(user.perfil)) {
    return <Navigate to="/acesso-restrito" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;