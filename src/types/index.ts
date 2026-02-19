export type UserProfile = 'aluno' | 'servidor' | 'gestor' | 'comunidade_externa';
export type UserStatus = 'ativo_comunidade' | 'ativo_vinculado' | 'gestor' | 'admin';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  matricula?: string;
  siape?: string;
  instituicao?: EventInstitution;
  campus?: string;
  perfil: UserProfile;
  status: UserStatus;
}

export type EventStatus = 'rascunho' | 'publicado' | 'encerrado';
export type EventModality = 'Presencial' | 'Online' | 'Híbrido';
export type EventInstitution = 'IFAL' | 'UFAL' | 'Comunidade';

export interface Event {
  id: string;
  titulo: string;
  instituicao: EventInstitution;
  campus: string;
  dataInicio: Date;
  dataFim?: Date;
  modalidade: EventModality;
  vagas?: number;
  local: string;
  descricao: string;
  status: EventStatus;
}

export type ActivityType = 'palestra' | 'oficina' | 'minicurso' | 'mesa_redonda' | 'seminario' | 'outro';

export interface Inscricao {
  id: string;
  eventoId: string;
  userId: string;
  status: 'inscrito' | 'cancelado';
  createdAt: Date;
}

export type VinculoStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface Vinculo {
  id: string;
  userId: string;
  userNome: string;
  userEmail: string;
  instituicao: EventInstitution;
  campus: string;
  perfilSolicitado: UserProfile;
  matriculaOuSiape: string;
  status: VinculoStatus;
  createdAt: Date;
}

export interface Presenca {
  id: string;
  atividadeId: string;
  userId: string;
  presente: boolean;
  marcadoPor: string; // userId of manager
  createdAt: Date;
}

export interface Activity {
  id: string;
  eventoId: string;
  titulo: string;
  tipo: ActivityType;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
  localOuLink: string;
  responsavel?: string;
  cargaHorariaMinutos: number;
}

export interface Certificate {
  id: string;
  eventId: string;
  codigo: string;
  cargaHoraria: number;
  dataEmissao: Date;
}

export type NotificationType = 'evento' | 'certificado' | 'sistema' | 'vinculo';

export interface Notification {
  id: string;
  userId: string;
  titulo: string;
  mensagem: string;
  tipo: NotificationType;
  lida: boolean;
  createdAt: Date;
  referenciaId?: string; // ID do evento ou certificado
}
