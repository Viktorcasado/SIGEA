import { Inscricao, InscricaoStatus } from '@/src/types';
import { mockUsers } from '@/src/data/mock';

const mockInscricoesDB: Inscricao[] = [
  { id: 1, event_id: 2, user_id: mockUsers[1].id, status_inscricao: 'confirmada', created_at: new Date() },
  { id: 2, event_id: 3, user_id: mockUsers[2].id, status_inscricao: 'confirmada', created_at: new Date() },
];

export const InscricaoRepositoryMock = {
  async getStatus(eventId: number, userId: string): Promise<InscricaoStatus | null> {
    const inscricao = mockInscricoesDB.find(i => i.event_id === eventId && i.user_id === userId);
    return inscricao ? inscricao.status_inscricao : null;
  },

  async listByEvento(eventId: number): Promise<Inscricao[]> {
    return mockInscricoesDB.filter(i => i.event_id === eventId && i.status_inscricao === 'confirmada');
  },

  async listByUser(userId: string): Promise<Inscricao[]> {
    return mockInscricoesDB.filter(i => i.user_id === userId && i.status_inscricao === 'confirmada');
  },

  async createInscricao(eventId: number, userId: string): Promise<Inscricao> {
    const newInscricao: Inscricao = {
      id: Math.floor(Math.random() * 10000),
      event_id: eventId,
      user_id: userId,
      status_inscricao: 'confirmada',
      created_at: new Date(),
    };
    mockInscricoesDB.push(newInscricao);
    return newInscricao;
  },

  async cancelInscricao(eventId: number, userId: string): Promise<void> {
    const index = mockInscricoesDB.findIndex(i => i.event_id === eventId && i.user_id === userId);
    if (index > -1) {
      mockInscricoesDB[index].status_inscricao = 'cancelada';
    }
  },

  async countByEvento(eventId: number): Promise<number> {
    return mockInscricoesDB.filter(i => i.event_id === eventId && i.status_inscricao === 'confirmada').length;
  },
};
