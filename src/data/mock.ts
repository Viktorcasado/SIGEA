import { Event, User, Certificate, Notification } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user001',
    nome: 'Maria Silva (Gestora)',
    email: 'maria.silva@ifal.edu.br',
    cpf: '123.456.789-00',
    siape: '1234567',
    instituicao: 'IFAL',
    campus: 'Maceió',
    perfil: 'gestor',
    status: 'gestor',
    is_organizer: true
  },
  {
    id: 'user002',
    nome: 'João Santos (Aluno)',
    email: 'joao.santos@aluno.ufal.br',
    cpf: '111.222.333-44',
    matricula: '2023123456',
    instituicao: 'UFAL',
    campus: 'A. C. Simões',
    perfil: 'aluno',
    status: 'ativo_vinculado',
    is_organizer: false
  },
];

export const mockUser: User = mockUsers[0];

export const mockEvents: Event[] = [
    {
        id: 'evt01',
        titulo: 'Semana de Tecnologia',
        descricao: 'Um evento focado nas últimas tendências de desenvolvimento de software e IA.',
        instituicao: 'IFAL',
        campus: 'Maceió',
        dataInicio: new Date('2026-02-20'),
        dataFim: new Date('2026-02-22'),
        modalidade: 'Híbrido',
        local: 'Auditório Principal & Online',
        vagas: 200,
        status: 'rascunho',
        carga_horaria: 20
    },
    { id: 'evt02', titulo: 'Congresso de Biologia', instituicao: 'UFAL', campus: 'A. C. Simões', dataInicio: new Date(2024, 7, 25), dataFim: new Date(2024, 7, 27), modalidade: 'Online', vagas: 200, local: 'Google Meet', descricao: 'Descrição detalhada do congresso.', status: 'publicado', carga_horaria: 8 },
    { id: 'evt03', titulo: 'Feira de Robótica', instituicao: 'IFAL', campus: 'Maceió', dataInicio: new Date(2024, 8, 1), dataFim: new Date(2024, 8, 2), modalidade: 'Híbrido', vagas: 100, local: 'Ginásio e YouTube', descricao: 'Descrição da feira de robótica.', status: 'publicado', carga_horaria: 40 },
    { id: 'evt04', titulo: 'Palestra de Empreendedorismo', instituicao: 'Comunidade', campus: 'Online', dataInicio: new Date(2024, 8, 5), dataFim: new Date(2024, 8, 5), modalidade: 'Online', vagas: 0, local: 'Zoom', descricao: 'Palestra sobre como começar seu negócio.', status: 'encerrado', carga_horaria: 2 },
    { id: 'evt05', titulo: 'Minicurso de Python', instituicao: 'UFAL', campus: 'Arapiraca', dataInicio: new Date(2024, 8, 10), dataFim: new Date(2024, 8, 11), modalidade: 'Presencial', vagas: 30, local: 'Lab. 4', descricao: 'Minicurso prático de Python para iniciantes.', status: 'publicado', carga_horaria: 12 },
];

export const mockProximosEventos = mockEvents.slice(0, 5);

export const mockAvisos = [
    {
        id: 'avs001',
        texto: 'As inscrições para o programa de monitoria terminam esta semana.',
    },
    {
        id: 'avs002',
        texto: 'Novo edital de auxílio estudantil publicado. Confira no site.',
    },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif001',
    userId: 'user001',
    titulo: 'Certificado Disponível',
    mensagem: 'Seu certificado para a \"Semana de TI\" já pode ser emitido.',
    tipo: 'certificado',
    lida: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    referenciaId: 'cert001',
  },
  {
    id: 'notif002',
    userId: 'user001',
    titulo: 'Evento Próximo',
    mensagem: 'O evento \"Congresso de Biologia\" começa amanhã!',
    tipo: 'evento',
    lida: false,
    createdAt: new Date(),
    referenciaId: 'evt02',
  },
  {
    id: 'notif003',
    userId: 'user001',
    titulo: 'Atualização do Sistema',
    mensagem: 'Atualizamos nossos Termos de Uso. Confira as novidades.',
    tipo: 'sistema',
    lida: true,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert001',
    eventoId: 'evt01',
    userId: 'user001',
    codigo: 'SIGEA-0001-24',
    cargaHoraria: 20,
    dataEmissao: new Date(2024, 7, 25),
  },
  {
    id: 'cert002',
    eventoId: 'evt02',
    userId: 'user001',
    codigo: 'SIGEA-0002-24',
    cargaHoraria: 8,
    dataEmissao: new Date(2024, 7, 28),
  },
  {
    id: 'cert003',
    eventoId: 'evt03',
    userId: 'user001',
    codigo: 'SIGEA-0003-24',
    cargaHoraria: 40,
    dataEmissao: new Date(2024, 8, 5),
  },
  {
    id: 'cert004',
    eventoId: 'evt05',
    userId: 'user001',
    codigo: 'SIGEA-0004-24',
    cargaHoraria: 12,
    dataEmissao: new Date(2024, 8, 15),
  },
  {
    id: 'cert005',
    eventoId: 'evt06',
    userId: 'user001',
    codigo: 'SIGEA-0005-24',
    cargaHoraria: 16,
    dataEmissao: new Date(2024, 8, 18),
  },
  {
    id: 'cert006',
    eventoId: 'evt09',
    userId: 'user001',
    codigo: 'SIGEA-0006-24',
    cargaHoraria: 30,
    dataEmissao: new Date(2024, 9, 20),
  },
];