import { useUser } from '@/src/contexts/UserContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading, session } = useUser();
  const location = useLocation();

  // Enquanto estiver carregando a sessão inicial ou o perfil, mostramos o loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-500 font-medium">Sincronizando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não houver usuário (nem sessão), redireciona para o login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;