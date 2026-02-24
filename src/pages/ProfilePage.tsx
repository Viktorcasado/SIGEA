"use client";

import { useUser } from '@/src/contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  User as UserIcon, 
  Building, 
  FileText, 
  Shield, 
  LogOut, 
  Calendar, 
  Clock, 
  PlusCircle, 
  LayoutDashboard, 
  FileBarChart, 
  ShieldCheck, 
  FileQuestion, 
  Info, 
  BookOpen,
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';

const ProfileHeader = () => {
  const { user } = useUser();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 mb-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-200 rotate-3 overflow-hidden">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.nome} 
                className="w-full h-full object-cover -rotate-3 scale-110"
              />
            ) : (
              <span className="-rotate-3">{getInitials(user.nome)}</span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user.nome}</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">{user.email}</p>
        
        <div className="mt-4 flex gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
            {user.perfil.replace('_', ' ')}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
            {user.campus || 'Sem Campus'}
          </span>
        </div>
      </div>
    </div>
  );
};

const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-6 mb-4">{title}</h2>
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      {children}
    </div>
  </div>
);

const MenuItem = ({ to, icon: Icon, label, color = "text-gray-500", onClick }: { to?: string; icon: any; label: string; color?: string; onClick?: () => void }) => {
  const content = (
    <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="font-bold text-gray-700">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left border-b border-gray-50 last:border-b-0">{content}</button>;
  }

  return (
    <Link to={to || '#'} className="block border-b border-gray-50 last:border-b-0">
      {content}
    </Link>
  );
};

export default function ProfilePage() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja encerrar a sessão?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-12"
    >
      <ProfileHeader />

      <MenuSection title="Minha Conta">
        <MenuItem to="/perfil/editar" icon={UserIcon} label="Editar Perfil" color="text-indigo-500" />
        <MenuItem to="/perfil/instituicao-campus" icon={Building} label="Vínculo Institucional" color="text-blue-500" />
        <MenuItem to="/perfil/documentos" icon={FileText} label="Meus Documentos" color="text-orange-500" />
        <MenuItem to="/perfil/seguranca" icon={Shield} label="Segurança e Senha" color="text-red-500" />
      </MenuSection>

      <MenuSection title="Atividades">
        <MenuItem to="/perfil/eventos-inscritos" icon={Calendar} label="Eventos Inscritos" color="text-green-500" />
        <MenuItem to="/notificacoes" icon={Bell} label="Notificações" color="text-yellow-500" />
        
        {['servidor', 'gestor', 'admin'].includes(user.perfil) && (
          <>
            <MenuItem to="/evento/criar" icon={PlusCircle} label="Criar Novo Evento" color="text-indigo-600" />
            <MenuItem to="/gestor/painel" icon={LayoutDashboard} label="Painel do Gestor" color="text-purple-500" />
          </>
        )}
      </MenuSection>

      <MenuSection title="Suporte e Legal">
        <MenuItem to="/sistema/sobre" icon={Info} label="Sobre o SIGEA" color="text-gray-400" />
        <MenuItem to="/sistema/termos" icon={BookOpen} label="Termos de Uso" color="text-gray-400" />
        <MenuItem to="/sistema/politicas" icon={FileQuestion} label="Privacidade" color="text-gray-400" />
      </MenuSection>

      <div className="px-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 font-black rounded-[2rem] hover:bg-red-100 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          Encerrar Sessão
        </button>
      </div>
    </motion.div>
  );
}