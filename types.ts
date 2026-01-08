
export enum UserRole {
  PARTICIPANT = 'PARTICIPANT',
  ORGANIZER = 'ORGANIZER'
}

export interface Activity {
  id: string;
  event_id: string;
  time: string;
  title: string;
  loc: string;
  type: string;
  icon: string;
  created_at?: string;
}

export interface Event {
  id: string;
  created_at?: string;
  organizer_id?: string;
  title: string;
  description: string;
  campus: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  type: string;
  status: 'Inscrições Abertas' | 'Em Breve' | 'Encerrado' | 'Rascunho';
  price: string;
  certificateHours: number;
  updated_at?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  campus: string;
  status: string;
  photo_url?: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado';
  created_at: string;
}

// Added Certificate interface to fix the module error in Certificates.tsx
export interface Certificate {
  id: string;
  event_id: string;
  user_id: string;
  event_title: string;
  hours: number;
  issue_date: string;
  validation_code: string;
}
