
import { Event } from './types';

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'X SEMANA DE TECNOLOGIA',
    description: 'Aprenda os conceitos básicos de IA e Machine Learning com profissionais renomados da área tecnológica e explore as novas fronteiras da inovação no IFAL.',
    campus: 'IFAL - Campus Maceió',
    date: '12-14 OUT',
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
    title: 'WORKSHOP DE ROBÓTICA',
    description: 'Montagem e programação de robôs aplicados ao ensino fundamental e médio utilizando Arduino e sensores inteligentes.',
    campus: 'IFAL - Campus Arapiraca',
    date: '20 NOV',
    time: '09:00 - 17:00',
    location: 'Lab 03 - Bloco B',
    imageUrl: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=1200&q=80',
    type: 'Workshop',
    status: 'Em Breve',
    price: 'Gratuito',
    certificateHours: 8
  }
];

export const INSTITUTION_CONTACTS: Record<string, { email: string; phone: string; dept: string }> = {
  "IFAL - Campus Maceió": { email: "coordenacao.maceio@ifal.edu.br", phone: "(82) 2126-7000", dept: "Coordenação de Eventos" },
  "IFAL - Campus Arapiraca": { email: "direcao.arapiraca@ifal.edu.br", phone: "(82) 2126-6200", dept: "Departamento de Extensão" },
  "IFAL - Campus Palmeira dos Índios": { email: "extensao.palmeira@ifal.edu.br", phone: "(82) 2126-6300", dept: "Setor Acadêmico" },
  "IFAL - Campus Satuba": { email: "ensino.satuba@ifal.edu.br", phone: "(82) 2126-6400", dept: "Coordenação Pedagógica" },
  "IFAL - Campus Marechal Deodoro": { email: "eventos.marechal@ifal.edu.br", phone: "(82) 2126-6500", dept: "Secretaria de Cursos" },
  "IFAL - Campus Penedo": { email: "apoio.penedo@ifal.edu.br", phone: "(82) 2126-6600", dept: "Coordenação Geral" },
  "IFAL - Campus Murici": { email: "murici@ifal.edu.br", phone: "(82) 2126-6700", dept: "Direção de Ensino" },
  "IFAL - Campus Santana do Ipanema": { email: "santana@ifal.edu.br", phone: "(82) 2126-6800", dept: "Setor de Eventos" },
  "IFAL - Campus Coruripe": { email: "coruripe@ifal.edu.br", phone: "(82) 2126-6900", dept: "Coordenadoria" },
  "IFAL - Campus Viçosa": { email: "vicosa@ifal.edu.br", phone: "(82) 2126-7100", dept: "Núcleo de Extensão" },
  "IFAL - Campus São Miguel dos Campos": { email: "saomiguel@ifal.edu.br", phone: "(82) 2126-7200", dept: "Secretaria Acadêmica" },
  "IFAL - Campus Rio Largo": { email: "riolargo@ifal.edu.br", phone: "(82) 2126-7300", dept: "Apoio ao Estudante" },
  "IFAL - Campus Maragogi": { email: "maragogi@ifal.edu.br", phone: "(82) 2126-7400", dept: "Eventos" },
  "IFAL - Campus Batalha": { email: "batalha@ifal.edu.br", phone: "(82) 2126-7500", dept: "Ensino e Pesquisa" },
  "IFAL - Campus Benedito Bentes": { email: "benedito.bentes@ifal.edu.br", phone: "(82) 2126-7600", dept: "Coordenação de Extensão" },
  "UFAL - Campus A.C. Simões (Maceió)": { email: "proex@ufal.br", phone: "(82) 3214-1000", dept: "Pró-Reitoria de Extensão" },
  "UFAL - Campus Arapiraca": { email: "extensao.arapiraca@ufal.br", phone: "(82) 3482-1800", dept: "Secretaria de Eventos" },
  "UFAL - Campus Sertão (Delmiro Gouveia)": { email: "direcao.sertao@ufal.br", phone: "(82) 3641-5200", dept: "Direção Geral" },
  "Outro IF (Rede Federal)": { email: "reitoria.sigea@ifal.edu.br", phone: "(82) 2126-7001", dept: "Central SIGEA Nacional" }
};

export const CAMPUS_LIST = Object.keys(INSTITUTION_CONTACTS);
