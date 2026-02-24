export interface User {
  id: string;
  email?: string;
  nome: string;
  telefone?: string;
  status: 'ativo_comunidade' | 'ativo_vinculado' | 'gestor' | 'admin';
  perfil: 'aluno' | 'servidor' | 'comunidade_externa' | 'gestor' | 'admin';
  cpf?: string;
  matricula?: string;
  siape?: string;
  instituicao?: string;
  campus?: string;
  avatar_url?: string;
}

export interface Event {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  banner_url?: string;
  status: 'rascunho' | 'publicado' | 'encerrado';
  modalidade: 'Presencial' | 'Online' | 'Híbrido';
  vagas?: number;
  instituicao?: string;
  campus?: string;
}

export interface Activity {
  id: string;
  event_id: string;
  titulo: string;
  descricao: string;
  tipo: ActivityType;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  carga_horaria_minutos?: number;
}

export type ActivityType = 'palestra' | 'oficina' | 'minicurso' | 'mesa_redonda' | 'seminario' | 'outro';

export interface Inscricao {
  id: string;
  event_id: string;
  user_id: string;
  status: 'confirmada' | 'cancelada';
  registered_at: string;
}

export interface Vinculo {
  id: string;
  user_id: string;
  instituicao: string;
  campus: string;
  matricula?: string;
  siape?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
}

export type NotificationType = 'evento' | 'certificado' | 'sistema' | 'vinculo';

export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: NotificationType;
  lida: boolean;
  created_at: string;
  referenciaId?: string;
}

export interface Certificate {
  id: string;
  evento_titulo: string;
  nome_participante: string;
  data_emissao: string;
  codigo_validacao: string;
  carga_horaria_minutos: number;
  evento?: Event;
}

export type UserProfile = 'aluno' | 'servidor' | 'comunidade_externa' | 'gestor' | 'admin';
export type UserStatus = 'ativo_comunidade' | 'ativo_vinculado' | 'gestor' | 'admin';
export type EventInstitution = string;
export type EventModality = 'Presencial' | 'Online' | 'Híbrido';
export type Presenca = any;