"use client";

import React from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Building, 
  FileText, 
  Shield, 
  LogOut, 
  Calendar, 
  Clock, 
  FileQuestion, 
  Info, 
  BookOpen,
  Bell,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import ProfileHeader from '@/src/components/profile/ProfileHeader';
import ProfileMenuItem from '@/src/components/profile/ProfileMenuItem';
import ProfileSection from '@/src/components/profile/ProfileSection';
import OrganizerMenu from '@/src/components/profile/OrganizerMenu';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja encerrar a sessão?')) {
      await logout();
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6 pb-12"
    >
      <ProfileHeader user={user} />

      {/* Atalho para Painel do Gestor se tiver permissão */}
      {(user.is_organizer || user.perfil === 'aluno') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProfileSection title="Área Administrativa">
            <ProfileMenuItem 
              to="/gestor/painel" 
              icon={LayoutDashboard} 
              label="Painel de Controle" 
              description="Gerenciar eventos, inscritos e certificados"
              variant="success"
            />
          </ProfileSection>
        </motion.div>
      )}

      <ProfileSection title="Minha Conta" delay={0.2}>
        <ProfileMenuItem 
          to="/perfil/editar" 
          icon={UserIcon} 
          label="Dados Pessoais" 
          description="Nome, e-mail e telefone"
        />
        <ProfileMenuItem 
          to="/perfil/instituicao-campus" 
          icon={Building} 
          label="Vínculo Institucional" 
          description={user.campus || "Vincular ao IFAL/UFAL"}
        />
        <ProfileMenuItem 
          to="/perfil/seguranca" 
          icon={Shield} 
          label="Segurança" 
          description="Senha e autenticação"
        />
      </ProfileSection>

      <ProfileSection title="Atividades" delay={0.3}>
        <ProfileMenuItem 
          to="/perfil/eventos-inscritos" 
          icon={Calendar} 
          label="Minhas Inscrições" 
          description="Eventos confirmados"
        />
        <ProfileMenuItem 
          to="/perfil/presencas" 
          icon={Clock} 
          label="Histórico de Presença" 
          description="Atividades realizadas"
        />
        <ProfileMenuItem 
          to="/certificados" 
          icon={FileText} 
          label="Meus Certificados" 
          description="Download de documentos"
        />
      </ProfileSection>

      <ProfileSection title="Preferências e Suporte" delay={0.4}>
        <ProfileMenuItem 
          to="/notificacoes" 
          icon={Bell} 
          label="Notificações" 
        />
        <ProfileMenuItem 
          to="/perfil/configuracoes" 
          icon={Settings} 
          label="Ajustes do App" 
        />
        <ProfileMenuItem to="/sistema/sobre" icon={Info} label="Sobre o SIGEA" />
      </ProfileSection>

      <div className="px-2 pt-4">
        <ProfileMenuItem 
          onClick={handleLogout} 
          icon={LogOut} 
          label="Sair da Conta" 
          variant="danger" 
        />
      </div>
      
      <div className="text-center pb-8">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
          SIGEA Platform • v1.0.0
        </p>
      </div>
    </motion.div>
  );
}