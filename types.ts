
export enum UserRole {
  PARTICIPANT = 'PARTICIPANT',
  ORGANIZER = 'ORGANIZER'
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
