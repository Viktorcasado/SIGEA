
export type UserRole = 'student' | 'admin' | 'organizer' | 'participant';
export type UserType = 'aluno' | 'servidor' | 'externo';
export type RegistrationStatus = 'pending' | 'confirmed' | 'canceled' | 'Present' | 'Absent';

export interface User {
  id: string;
  full_name: string;
  role?: UserRole;
  user_type?: UserType;
  registration_number?: string;
  avatar_url?: string | null;
  campus?: string;
}

// Fix: Definition for Attendee added to avoid "missing member" errors in ManageAttendeesScreen.tsx and exportService.ts
export interface Attendee {
  user_id: string;
  id: string;
  name: string;
  status: RegistrationStatus;
  user_type?: UserType;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  location: string;
  workload: number;
  banner_url?: string;
  image_url?: string;
  imageUrl?: string;
  category?: string;
  hours?: number;
  speakers?: string[];
  document_url?: string;
  cert_pos_x?: number;
  cert_pos_y?: number;
  cert_orientation?: 'landscape' | 'portrait';
  organizer_id?: string;
}

export interface Registration {
  id: number;
  user_id: string;
  event_id: number;
  status: RegistrationStatus;
  created_at: string;
  events?: Event;
}

export interface Activity {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  type: 'Palestra' | 'Minicurso' | 'Workshop' | 'Mesa Redonda' | 'Outro';
  hours: number;
  location: string;
  start_time: string;
  end_time: string;
  date: string;
  generates_certificate: boolean;
  registration_count?: number;
  max_slots?: number;
}

export interface Certificate {
  id: number;
  eventTitle: string;
  eventDate: string;
  code: string;
  event: Event;
}

export interface Notification {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
  type?: 'event' | 'update' | 'announcement';
}

export type IconName = 
  | 'home' | 'home_fill' | 'calendar' | 'calendar_fill' | 'star' | 'star_fill' 
  | 'person_circle' | 'person_circle_fill' | 'sparkles' | 'sparkles_fill' 
  | 'map_fill' | 'user' | 'bell' | 'search' | 'location' | 'robot' | 'layout' 
  | 'arrow-left' | 'clock' | 'clock_fill' | 'users' | 'qrcode' | 'pencil' | 'shield' | 'ticket' 
  | 'bar-chart' | 'swatch' | 'life-buoy' | 'chevron-right' | 'users-group' | 'camera' | 'close' | 'plus' | 'trash' | 'check' 
  | 'arrows-outward' | 'arrow-path' | 'bolt' | 'bolt-slash' | 'ellipsis-vertical' | 'lock-closed' | 'list';
