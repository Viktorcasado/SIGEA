
export interface Event {
  id: number;
  category: string;
  date: string;
  title: string;
  location: string;
  imageUrl: string;
  hours?: number;
  speakers?: string[];
  description?: string;
  document_url?: string;
  cert_pos_x?: number;
  cert_pos_y?: number;
}

export type IconName = 'home' | 'home_fill' | 'calendar' | 'calendar_fill' | 'star' | 'star_fill' | 'person_circle' | 'person_circle_fill' | 'bell' | 'search' | 'location' | 'robot' | 'layout' | 'arrow-left' | 'clock' | 'users' | 'qrcode' | 'pencil' | 'shield' | 'ticket' | 'bar-chart' | 'swatch' | 'life-buoy' | 'chevron-right' | 'users-group' | 'camera' | 'close' | 'user' | 'sparkles' | 'sparkles_fill' | 'map_fill' | 'plus' | 'trash' | 'check' | 'arrows-outward' | 'arrow-path' | 'clock_fill' | 'bolt' | 'bolt-slash' | 'ellipsis-vertical' | 'lock-closed' | 'list';

export type UserType = 'aluno' | 'servidor' | 'externo';

export interface User {
  id: string;
  full_name: string;
  campus?: string;
  avatar_url?: string;
  user_type?: UserType;
  registration_number?: string;
}

export interface Certificate {
  id: string;
  eventTitle: string;
  eventDate: string;
  code: string;
  event: Event;
}

export interface Attendee {
    user_id: string;
    id: string;
    name: string;
    email?: string;
    status: 'Present' | 'Absent';
    avatar_url?: string;
    user_type?: UserType;
}

export interface Subscription {
    id: number;
    event_title: string;
    event_date: string;
    status: 'Confirmado' | 'Pendente';
}

export interface HoursRecord {
    id: number;
    event_name: string;
    hours: number;
    category: string;
}

export interface Activity {
  id: number;
  event_id: number;
  title: string;
  type: 'Palestra' | 'Minicurso' | 'Workshop' | 'Mesa Redonda' | 'Outro';
  start_time: string;
  end_time: string;
  hours: number;
  generates_certificate: boolean;
  location: string;
  date: string;
  max_slots?: number;
  registration_count?: number;
}

export interface Notification {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  type: 'event' | 'update' | 'announcement';
  is_read: boolean;
  created_at: string;
  user_id: string;
}
