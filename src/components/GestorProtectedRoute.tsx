import { useUser } from '@/src/contexts/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

const GestorProtectedRoute = () => {
  const { user } = useUser();

  if (!user || user.perfil !== 'gestor') {
    return <Navigate to="/gestor/acesso-restrito" replace />;
  }

  return <Outlet />;
};

export default GestorProtectedRoute;
