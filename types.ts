
export enum UserRole {
  PARTICIPANT = 'PARTICIPANT',
  ORGANIZER = 'ORGANIZER'
}

export interface Event {
  id: string;
  created_at?: string;
  title: string;
  description: string;
  campus: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  type: 'Workshop' | 'Palestra' | 'Curso' | 'Congresso';
  status: 'Inscrições Abertas' | 'Em Breve' | 'Encerrado' | 'Rascunho';
  price: string;
  certificateHours: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  campus: string;
  status: string;
}

export interface Certificate {
  id: string;
  eventTitle: string;
  date: string;
  hours: number;
  campus: string;
  status: 'Disponível' | 'Processando';
}
