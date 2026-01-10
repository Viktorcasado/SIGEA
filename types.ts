
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
  campus: string;
  name: string;
  email: string;
  cpf?: string;
  role: string;
  registration_number?: string;
  photo_url?: string;
  created_at: string;
}

export interface CertificateTemplate {
  id: string;
  event_id: string;
  title: string;
  attribution: string;
  hours: number;
  image_url: string;
  content_template: string;
  status: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  event_id: string;
  user_id: string;
  event_title: string;
  hours: number;
  issue_date: string;
  validation_code: string;
  template_url?: string;
}
