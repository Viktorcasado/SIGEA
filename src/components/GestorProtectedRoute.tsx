import { useUser } from '@/src/contexts/UserContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const GestorProtectedRoute = () => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Permitimos gestores, servidores, admins e alunos (para testes/organização)
  const allowedProfiles = ['gestor', 'servidor', 'aluno', 'admin'];

  if (!allowedProfiles.includes(user.perfil)) {
    return <Navigate to="/gestor/acesso-restrito" replace />;
  }

  return <Outlet />;
};

export default GestorProtectedRoute;