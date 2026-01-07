
import { Event, Participant, Certificate } from './types';

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'X Semana de Tecnologia da Informação',
    description: 'Aprenda os conceitos básicos de IA e Machine Learning com profissionais da área.',
    campus: 'Campus Maceió',
    date: '12-14 Out',
    time: '08:00 - 18:00',
    location: 'Auditório Central',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    type: 'Congresso',
    status: 'Inscrições Abertas',
    price: 'Gratuito',
    certificateHours: 20
  },
  {
    id: '2',
    title: 'Workshop de Robótica Educacional',
    description: 'Montagem e programação de robôs aplicados ao ensino fundamental.',
    campus: 'Campus Arapiraca',
    date: '20 Nov',
    time: '09:00 - 17:00',
    location: 'Lab 03 - Bloco B',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    type: 'Workshop',
    status: 'Em Breve',
    price: 'Gratuito',
    certificateHours: 8
  },
  {
    id: '3',
    title: 'II Simpósio de Agroecologia',
    description: 'Discussão sobre sustentabilidade e novas técnicas de plantio.',
    campus: 'Campus Satuba',
    date: '05 Dez',
    time: '08:30 - 16:30',
    location: 'Auditório Principal',
    imageUrl: 'https://images.unsplash.com/photo-1495107336281-199c15864eea?auto=format&fit=crop&w=800&q=80',
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
  },
  {
    id: 'c3',
    eventTitle: 'Palestra: Ética em IA',
    date: 'Ontem',
    hours: 2,
    campus: 'Evento Online',
    status: 'Processando'
  }
];

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Maria Silva', email: 'maria.silva@aluno.ifal.edu.br', role: 'Estudante', campus: 'Campus Maceió', status: 'Pago' },
  { id: 'p2', name: 'João Santos', email: 'joao.santos@ifal.edu.br', role: 'Professor', campus: 'Campus Arapiraca', status: 'Pendente' },
  { id: 'p3', name: 'Ana Costa', email: 'ana.costa@externo.com', role: 'Visitante', campus: 'Comunidade Externa', status: 'Pago' },
  { id: 'p4', name: 'Pedro Lima', email: 'pedro.lima@aluno.ifal.edu.br', role: 'Monitor', campus: 'Campus Maceió', status: 'Isento' }
];

export const CAMPUS_LIST = [
  "Campus Maceió", "Campus Arapiraca", "Campus Palmeira dos Índios",
  "Campus Satuba", "Campus Marechal Deodoro", "Campus Penedo",
  "Campus Piranhas", "Campus Maragogi", "Campus Santana do Ipanema",
  "Campus São Miguel dos Campos", "Campus Viçosa", "Campus Coruripe",
  "Campus Rio Largo", "Campus Murici", "Campus Batalha"
];
