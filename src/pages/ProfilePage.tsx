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
  ClipboardList, 
  Clock, 
  PlusCircle, 
  LayoutDashboard, 
  FileBarChart, 
  ShieldCheck, 
  FileQuestion, 
  Info, 
  BookOpen 
} from 'lucide-react';
import ProfileHeader from '@/src/components/profile/ProfileHeader';
import ProfileMenuItem from '@/src/components/profile/ProfileMenuItem';
import ProfileSection from '@/src/components/profile/ProfileSection';

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
          <>
            <ProfileMenuItem to="/evento/criar" icon={PlusCircle} label="Criar evento" />
            <ProfileMenuItem to="/perfil/meus-eventos" icon={Calendar} label="Meus eventos" />
            <ProfileMenuItem to="/perfil/inscritos" icon={ClipboardList} label="Lista de inscritos" />
            <ProfileMenuItem to="/perfil/marcar-presenca" icon={Clock} label="Marcar presença" />
          </>
        );
      case 'gestor':
        return (
          <>
            <ProfileMenuItem to="/gestor/painel" icon={LayoutDashboard} label="Painel do gestor" />
            <ProfileMenuItem to="/gestor/eventos" icon={Calendar} label="Eventos da instituição" />
            <ProfileMenuItem to="/gestor/relatorios" icon={FileBarChart} label="Relatórios" />
            <ProfileMenuItem to="/gestor/vinculos" icon={ShieldCheck} label="Aprovar vínculos" />
          </>
        );
      default: // aluno e comunidade_externa
        return (
          <>
            <ProfileMenuItem to="/perfil/eventos-inscritos" icon={Calendar} label="Eventos inscritos" />
            <ProfileMenuItem to="/perfil/presencas" icon={Clock} label="Minhas presenças" />
          </>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <ProfileHeader user={user} />

      <ProfileSection title="Conta" delay={0.1}>
        <ProfileMenuItem to="/perfil/editar" icon={UserIcon} label="Dados pessoais" />
        <ProfileMenuItem to="/perfil/instituicao-campus" icon={Building} label="Instituição e Campus" />
        <ProfileMenuItem to="/perfil/documentos" icon={FileText} label="Documentos e CPF" />
        <ProfileMenuItem to="/perfil/seguranca" icon={Shield} label="Segurança e Senha" />
      </ProfileSection>

      {user && (
        <ProfileSection title="Atividades Acadêmicas" delay={0.2}>
          {renderEventMenu()}
        </ProfileSection>
      )}

      <ProfileSection title="Suporte e Informações" delay={0.3}>
        <ProfileMenuItem to="/sistema/politicas" icon={FileQuestion} label="Privacidade" />
        <ProfileMenuItem to="/sistema/termos" icon={BookOpen} label="Termos de Uso" />
        <ProfileMenuItem to="/sistema/sobre" icon={Info} label="Sobre o SIGEA" />
      </ProfileSection>

      {user && (
        <div className="px-2">
          <ProfileMenuItem 
            onClick={handleLogout} 
            icon={LogOut} 
            label="Sair da conta" 
            variant="danger" 
          />
        </div>
      )}
      
      <div className="text-center pt-4">
        <p className="text-xs text-gray-400 font-medium">SIGEA v1.0.0 • IFAL/UFAL</p>
      </div>
    </div>
  );
}