import { useUser } from '@/src/contexts/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedProfiles: Array<'aluno' | 'servidor' | 'gestor' | 'admin' | 'comunidade_externa'>;
}

const ProtectedRoute = ({ allowedProfiles }: ProtectedRouteProps) => {
  const { user } = useUser();

  if (!user || !allowedProfiles.includes(user.perfil)) {
    return <Navigate to="/acesso-restrito" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
