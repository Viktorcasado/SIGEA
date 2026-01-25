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
}

export type IconName = 'home' | 'home_fill' | 'calendar' | 'calendar_fill' | 'star' | 'star_fill' | 'person_circle' | 'person_circle_fill' | 'bell' | 'search' | 'location' | 'robot' | 'layout' | 'arrow-left' | 'clock' | 'users' | 'qrcode' | 'pencil' | 'shield' | 'ticket' | 'bar-chart' | 'swatch' | 'life-buoy' | 'chevron-right' | 'users-group' | 'camera' | 'close' | 'user' | 'sparkles' | 'sparkles_fill' | 'map_fill' | 'plus' | 'trash' | 'check' | 'arrows-outward' | 'arrow-path' | 'clock_fill' | 'bolt' | 'bolt-slash';

export type UserType = 'aluno' | 'servidor' | 'externo';

export interface User {
  id: string; // This will now be the Supabase auth UUID
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
    user_id: string; // Supabase auth UUID
    id: string; // registration_number
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
  start_time: string; // ISO 8601 format
  end_time: string; // ISO 8601 format
  hours: number;
  generates_certificate: boolean;
  location: string;
  date: string; // YYYY-MM-DD format
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