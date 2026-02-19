export type UserProfile = 'aluno' | 'servidor' | 'gestor' | 'comunidade_externa';
export type UserStatus = 'ativo_comunidade' | 'ativo_vinculado' | 'gestor' | 'admin';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
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
  organizer_id?: string;
  image_url?: string;
}

export interface Inscricao {
  id: string;
  eventoId: string;
  userId: string;
  status: string;
  createdAt: Date;
  event?: Event;
}

export interface Certificate {
  id: string;
  userId: string;
  eventoId: string;
  codigo: string;
  dataEmissao: Date;
  cargaHoraria?: number;
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