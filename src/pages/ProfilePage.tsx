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
  PlusCircle, 
  FileQuestion, 
  Info, 
  BookOpen,
  Bell,
  Settings,
  Users
} from 'lucide-react';
import ProfileHeader from '@/src/components/profile/ProfileHeader';
import ProfileMenuItem from '@/src/components/profile/ProfileMenuItem';
import ProfileSection from '@/src/components/profile/ProfileSection';
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

  const renderAcademicMenu = () => {
    if (!user) return null;
    
    if (user.is_organizer) {
      return (
        <ProfileSection title="Gestão de Eventos" delay={0.2}>
          <ProfileMenuItem 
            to="/evento/criar" 
            icon={PlusCircle} 
            label="Criar Novo Evento" 
            description="Publicar na plataforma"
          />
          <ProfileMenuItem 
            to="/perfil/meus-eventos" 
            icon={Calendar} 
            label="Meus Eventos" 
            description="Gerenciar cronogramas e detalhes"
          />
          <ProfileMenuItem 
            to="/perfil/inscritos" 
            icon={Users} 
            label="Lista de Inscritos" 
            description="Ver participantes por evento"
          />
          <ProfileMenuItem 
            to="/perfil/marcar-presenca" 
            icon={Clock} 
            label="Controle de Presença" 
            description="Validar via QR Code ou Lista"
          />
        </ProfileSection>
      );
    }

    return (
      <ProfileSection title="Minha Participação" delay={0.2}>
        <ProfileMenuItem 
          to="/perfil/eventos-inscritos" 
          icon={Calendar} 
          label="Inscrições Ativas" 
          description="Eventos que vou participar"
        />
        <ProfileMenuItem 
          to="/perfil/presencas" 
          icon={Clock} 
          label="Histórico de Presença" 
          description="Atividades confirmadas"
        />
        <ProfileMenuItem 
          to="/certificados" 
          icon={FileText} 
          label="Meus Certificados" 
          description="Baixar documentos emitidos"
        />
      </ProfileSection>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-8 pb-12"
    >
      <ProfileHeader user={user} />

      <ProfileSection title="Configurações de Conta" delay={0.1}>
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
          description="IFAL, UFAL ou Comunidade"
        />
        <ProfileMenuItem 
          to="/perfil/seguranca" 
          icon={Shield} 
          label="Segurança" 
          description="Alterar senha e acessos"
        />
      </ProfileSection>

      {renderAcademicMenu()}

      <ProfileSection title="Preferências" delay={0.3}>
        <ProfileMenuItem 
          to="/notificacoes" 
          icon={Bell} 
          label="Notificações" 
          description="Alertas de eventos e certificados"
        />
        <ProfileMenuItem 
          to="/perfil/configuracoes" 
          icon={Settings} 
          label="Ajustes do App" 
          description="Tema e idioma"
        />
      </ProfileSection>

      <ProfileSection title="Suporte" delay={0.4}>
        <ProfileMenuItem to="/sistema/politicas" icon={FileQuestion} label="Privacidade" />
        <ProfileMenuItem to="/sistema/termos" icon={BookOpen} label="Termos de Uso" />
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
      
      <div className="text-center">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
          Desenvolvido por SIGEA Team • v1.0.0
        </p>
      </div>
    </motion.div>
  );
}