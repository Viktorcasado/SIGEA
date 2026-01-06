
export enum UserRole {
  PARTICIPANT = 'PARTICIPANT',
  ORGANIZER = 'ORGANIZER'
}

export enum UserCategory {
  ALUNO = 'ALUNO',
  SERVIDOR = 'SERVIDOR',
  COORDENADOR = 'COORDENADOR',
  PALESTRANTE = 'PALESTRANTE',
  AVALIADOR = 'AVALIADOR',
  VISITANTE = 'VISITANTE'
}

export interface UserProfile {
  name: string;
  photo: string;
  campus: string;
  email: string;
  user_category?: UserCategory;
  registration_number?: string;
  department?: string;
  course?: string;
  cpf?: string;
  phone?: string;
  is_verified?: boolean;
}


export interface Event {
  id: string;
  title: string;
  description: string;
  campus: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  certificateTemplateUrl?: string; // Novo campo para o modelo do certificado
  type: 'Workshop' | 'Palestra' | 'Curso' | 'Congresso';
  status: 'Inscrições Abertas' | 'Em Breve' | 'Encerrado' | 'Rascunho';
  price: number | 'Gratuito';
  certificateHours?: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  campus: string;
  status: 'Pago' | 'Pendente' | 'Isento' | 'Cancelado' | 'Presente';
}

export interface Certificate {
  id: string;
  eventTitle: string;
  date: string;
  hours: number;
  campus: string;
  status: 'Disponível' | 'Processando';
}

export interface Activity {
  id: string;
  event_id: string;
  title: string;
  time: string;
  description?: string;
}
