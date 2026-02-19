import { useUser } from '@/src/contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, User as UserIcon, Building, FileText, Shield, LogOut, Calendar, ClipboardList, Clock, PlusCircle, LayoutDashboard, FileBarChart, ShieldCheck, FileQuestion, Info, BookOpen } from 'lucide-react';

const ProfileHeader = () => {
  const { user } = useUser();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const statusBadge = () => {
    if (!user) return null;
    const statuses = {
      ativo_comunidade: { text: 'Comunidade Ativa', color: 'bg-blue-100 text-blue-800' },
      ativo_vinculado: { text: 'Vínculo Institucional', color: 'bg-green-100 text-green-800' },
      gestor: { text: 'Gestor', color: 'bg-purple-100 text-purple-800' },
      admin: { text: 'Administrador', color: 'bg-red-100 text-red-800' },
    };
    const current = statuses[user.status] || { text: 'Status Desconhecido', color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${current.color}`}>{current.text}</span>;
  };

  const ctaButton = () => {
    if (!user) return null;
    if (user.status === 'ativo_comunidade') {
      return <Link to="/perfil/instituicao-campus" className="mt-2 text-sm text-indigo-600 font-semibold hover:underline">Confirmar vínculo institucional</Link>;
    }
    return <Link to="/perfil/editar" className="mt-2 text-sm text-gray-600 font-semibold hover:underline">Atualizar dados</Link>;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
        {user ? getInitials(user.nome) : 'VI'}
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-800">{user?.nome || 'Visitante'}</h1>
        {user && <div className="mt-1">{statusBadge()}</div>}
        {ctaButton()}
      </div>
    </div>
  );
};

const MenuItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
  <Link to={to} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b last:border-b-0 first:rounded-t-xl last:rounded-b-xl">
    <div className="flex items-center gap-4">
      <Icon className="w-5 h-5 text-gray-500" />
      <span className="font-medium text-gray-800">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </Link>
);

export default function ProfilePage() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja encerrar a sessão?')) {
      logout();
      navigate('/');
    }
  };

  const renderEventMenu = () => {
    if (!user) return null;
    switch (user.perfil) {
      case 'servidor':
        return (
          <div className="rounded-xl shadow-sm overflow-hidden">
            <MenuItem to="/evento/criar" icon={PlusCircle} label="Criar evento" />
            <MenuItem to="/perfil/meus-eventos" icon={Calendar} label="Meus eventos" />
            <MenuItem to="/perfil/inscritos" icon={ClipboardList} label="Lista de inscritos" />
            <MenuItem to="/perfil/marcar-presenca" icon={Clock} label="Marcar presença" />
          </div>
        );
      case 'gestor':
        return (
            <div className="rounded-xl shadow-sm overflow-hidden">
                <MenuItem to="/gestor/painel" icon={LayoutDashboard} label="Painel do gestor" />
                <MenuItem to="/gestor/eventos" icon={Calendar} label="Eventos da instituição" />
                <MenuItem to="/gestor/relatorios" icon={FileBarChart} label="Relatórios" />
                <MenuItem to="/gestor/vinculos" icon={ShieldCheck} label="Aprovar vínculos" />
            </div>
        );
      default: // aluno e comunidade_externa
        return (
          <div className="rounded-xl shadow-sm overflow-hidden">
            <MenuItem to="/perfil/eventos-inscritos" icon={Calendar} label="Eventos inscritos" />
            <MenuItem to="/perfil/presencas" icon={Clock} label="Presenças" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <ProfileHeader />

      <section>
        <h2 className="text-sm font-bold text-gray-500 uppercase px-4 mb-2">Conta</h2>
        <div className="rounded-xl shadow-sm overflow-hidden">
          <MenuItem to="/perfil/editar" icon={UserIcon} label="Editar dados do perfil" />
          <MenuItem to="/perfil/instituicao-campus" icon={Building} label="Instituição e Campus" />
          <MenuItem to="/perfil/documentos" icon={FileText} label="Documentos" />
          <MenuItem to="/perfil/seguranca" icon={Shield} label="Segurança" />
        </div>
      </section>

      {user && <section>
        <h2 className="text-sm font-bold text-gray-500 uppercase px-4 mb-2">Eventos</h2>
        {renderEventMenu()}
      </section>}

      <section>
        <h2 className="text-sm font-bold text-gray-500 uppercase px-4 mb-2">Sistema</h2>
        <div className="rounded-xl shadow-sm overflow-hidden">
          <MenuItem to="/sistema/politicas" icon={FileQuestion} label="Políticas e Privacidade" />
          <MenuItem to="/sistema/termos" icon={BookOpen} label="Termos de Uso" />
          <MenuItem to="/sistema/sobre" icon={Info} label="Sobre o SIGEA" />
        </div>
      </section>

      {user && <div className="rounded-xl shadow-sm overflow-hidden">
         <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-600">Encerrar sessão</span>
            </div>
        </button>
      </div>}
    </div>
  );
}
