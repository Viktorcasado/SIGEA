import { useUser } from '@/src/contexts/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

const GestorProtectedRoute = () => {
  const { user } = useUser();

  // Permitimos gestores, servidores e alunos (conforme solicitado)
  const allowedProfiles = ['gestor', 'servidor', 'aluno', 'admin'];

  if (!user || !allowedProfiles.includes(user.perfil)) {
    return <Navigate to="/gestor/acesso-restrito" replace />;
  }

  return <Outlet />;
};

export default GestorProtectedRoute;