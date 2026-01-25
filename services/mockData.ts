import { Event } from '../types';

export const mockEvents: Event[] = [
  {
    id: 1,
    category: 'Tecnologia',
    date: '22 A 26 DE OUTUBRO',
    title: 'SECINFO 2024 - Semana de Informática',
    location: 'IFAL - Campus Maceió',
    imageUrl: 'https://i.postimg.cc/1X9wYQdM/event-secinfo.jpg',
    hours: 20,
    speakers: ['Prof. Dr. Ricardo Rios', 'Profa. Dra. Eunice Amorim', 'Egressos de Sucesso'],
    description: 'A Semana de Informática (SECINFO) é um evento anual que reúne estudantes, professores e profissionais da área de TI para discutir as últimas tendências e tecnologias do mercado, com palestras, minicursos e competições.',
    document_url: 'https://www2.ifal.edu.br/campus/maceio/comunicacao/noticias/abertas-as-inscricoes-para-a-semana-de-informatica-do-ifal-maceio'
  },
  {
    id: 2,
    category: 'Pesquisa e Extensão',
    date: '15 A 18 DE NOVEMBRO',
    title: 'JEPEX 2024 - Jornada de Pesquisa e Extensão',
    location: 'Online / Híbrido',
    imageUrl: 'https://i.postimg.cc/k4G83x4Q/event-jepex.jpg',
    hours: 30,
    speakers: ['Profa. Dra. Maria da Ciência', 'Prof. Dr. João Pesquisador', 'Convidados Internacionais'],
    description: 'A JEPEX é um dos maiores eventos acadêmicos do IFAL, integrando as diversas áreas do conhecimento através da apresentação de trabalhos, palestras e minicursos.',
    document_url: 'https://www2.ifal.edu.br/'
  },
  {
    id: 3,
    category: 'Congresso',
    date: '05 DE DEZEMBRO',
    title: 'CONAC 2024 - Congresso Acadêmico do IFAL',
    location: 'Centro de Convenções de Maceió',
    imageUrl: 'https://i.postimg.cc/tJ6f8h0b/event-conac.jpg',
    hours: 40,
    speakers: ['Reitor do IFAL', 'Secretário de Educação', 'Palestrantes Nacionais'],
    description: 'O Congresso Acadêmico do IFAL (CONAC) é um espaço para a socialização de conhecimentos produzidos no âmbito do Ensino, da Pesquisa e da Extensão, contribuindo para a formação integral dos estudantes.',
    document_url: 'https://www2.ifal.edu.br/'
  },
  {
    id: 4,
    category: 'Feira de Ciências',
    date: '10 DE SETEMBRO',
    title: 'FICIENCIAS AL - Feira de Ciências e Engenharia',
    location: 'IFAL - Campus Arapiraca',
    imageUrl: 'https://i.postimg.cc/7hN9XvK3/event-ficiencias.jpg',
    hours: 15,
    speakers: ['Alunos Expositores', 'Comitê Científico Avaliador'],
    description: 'A FICIENCIAS é um evento que estimula a criatividade e a investigação científica entre estudantes da educação básica, técnica e superior, promovendo a popularização da ciência em Alagoas.',
    document_url: 'https://www2.ifal.edu.br/'
  }
];
