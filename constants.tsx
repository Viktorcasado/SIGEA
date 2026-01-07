
import { Event, Participant, Certificate } from './types';

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'X Semana de Tecnologia da Informação',
    description: 'Aprenda os conceitos básicos de IA e Machine Learning com profissionais renomados da área tecnológica e explore as novas fronteiras da inovação no IFAL.',
    campus: 'Campus Maceió',
    date: '12-14 Out',
    time: '08:00 - 18:00',
    location: 'Auditório Central',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    type: 'Congresso',
    status: 'Inscrições Abertas',
    price: 'Gratuito',
    certificateHours: 20
  },
  {
    id: '2',
    title: 'Workshop de Robótica Educacional',
    description: 'Montagem e programação de robôs aplicados ao ensino fundamental e médio utilizando Arduino e sensores inteligentes.',
    campus: 'Campus Arapiraca',
    date: '20 Nov',
    time: '09:00 - 17:00',
    location: 'Lab 03 - Bloco B',
    imageUrl: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=1200&q=80',
    type: 'Workshop',
    status: 'Em Breve',
    price: 'Gratuito',
    certificateHours: 8
  },
  {
    id: '3',
    title: 'II Simpósio de Agroecologia',
    description: 'Discussão sobre sustentabilidade, segurança alimentar e novas técnicas de plantio orgânico no agreste alagoano.',
    campus: 'Campus Satuba',
    date: '05 Dez',
    time: '08:30 - 16:30',
    location: 'Auditório Principal',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80',
    type: 'Palestra',
    status: 'Inscrições Abertas',
    price: 'Gratuito',
    certificateHours: 12
  }
];

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'c1',
    eventTitle: 'Semana de Tecnologia 2023',
    date: '20 Out 2023',
    hours: 20,
    campus: 'Campus Maceió',
    status: 'Disponível'
  },
  {
    id: 'c2',
    eventTitle: 'Workshop: Introdução ao Python',
    date: '15 Set 2023',
    hours: 4,
    campus: 'Online',
    status: 'Disponível'
  }
];

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Maria Silva', email: 'maria.silva@aluno.ifal.edu.br', role: 'Estudante', campus: 'Campus Maceió', status: 'Pago' },
  { id: 'p2', name: 'João Santos', email: 'joao.santos@ifal.edu.br', role: 'Professor', campus: 'Campus Arapiraca', status: 'Pendente' }
];

export const CAMPUS_LIST = [
  "Campus Maceió", "Campus Arapiraca", "Campus Palmeira dos Índios",
  "Campus Satuba", "Campus Marechal Deodoro", "Campus Penedo",
  "Campus Piranhas", "Campus Maragogi", "Campus Santana do Ipanema",
  "Campus São Miguel dos Campos", "Campus Viçosa", "Campus Coruripe",
  "Campus Rio Largo", "Campus Murici", "Campus Batalha"
];
