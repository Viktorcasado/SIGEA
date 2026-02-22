export type UserProfile = 'aluno' | 'servidor' | 'gestor' | 'comunidade_externa' | 'admin';
export type UserStatus = 'ativo_comunidade' | 'ativo_vinculado' | 'gestor' | 'admin';

export interface User {
  id: string;
  nome: string; // Nome completo (full_name no DB)
  username?: string; // Nome de usuário/apelido
  email: string;
  avatar_url?: string;
  matricula?: string;
  siape?: string;
  instituicao?: EventInstitution;
  campus?: string;
  perfil: UserProfile;
  status: UserStatus;
  is_organizer: boolean;
}

export type EventStatus = 'rascunho' | 'publicado' | 'encerrado';
export type EventModality = 'Presencial' | 'Online' | 'Híbrido';
export type EventInstitution = 'IFAL' | 'UFAL' | 'Comunidade';

export interface Event {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: Date;
  local: string;
  campus: string;
  instituicao: EventInstitution;
  modalidade: EventModality;
  status: EventStatus;
  vagas?: number;
  carga_horaria: number;
  organizer_id?: string;
  image_url?: string;
}

export interface CertificateTemplate {
  id: string;
  event_id: string;
  template_file_path: string;
  template_type: 'pdf' | 'image';
  mapping: CertificateMapping;
}

export interface CertificateMapping {
  fields: {
    [key: string]: {
      x: number;
      y: number;
      fontSize?: number;
      color?: string;
      size?: number;
    };
  };
}

export interface Certificate {
  id: string;
  userId: string;
  eventoId: string;
  codigo: string;
  dataEmissao: Date;
  cargaHoraria?: number;
  url_pdf?: string;
  event?: Event;
}

export interface Activity {
  id: string;
  event_id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  hours: number;
}

export type NotificationType = 'evento' | 'certificado' | 'sistema' | 'vinculo';

export interface Notification {
  id: string;
  userId: string | null;
  titulo: string;
  mensagem: string;
  tipo: NotificationType;
  lida: boolean;
  createdAt: Date;
  referenciaId?: string;
}

export interface Inscricao {
  id: string;
  eventoId: string;
  userId: string;
  status: string;
  createdAt: Date;
  event?: Event;
}