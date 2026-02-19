"use client";

import React from 'react';
import { PlusCircle, Calendar, Users, Clock, LayoutDashboard } from 'lucide-react';
import ProfileSection from './ProfileSection';
import ProfileMenuItem from './ProfileMenuItem';

const OrganizerMenu = () => {
  return (
    <ProfileSection title="Gestão de Eventos" delay={0.2}>
      <ProfileMenuItem 
        to="/gestor/painel" 
        icon={LayoutDashboard} 
        label="Painel do Gestor" 
        description="Visão geral e relatórios"
        variant="success"
      />
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
};

export default OrganizerMenu;