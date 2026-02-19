import { Inscricao } from '@/src/types';
import { mockUsers } from '@/src/data/mock';

const mockInscricoesDB: Inscricao[] = [
  { id: 'ins01', eventoId: 'evt02', userId: mockUsers[1].id, status: 'inscrito', createdAt: new Date() },
  { id: 'ins02', eventoId: 'evt03', userId: mockUsers[2].id, status: 'inscrito', createdAt: new Date() },
];

export const InscricaoRepositoryMock = {
  async getStatus(eventoId: string, userId: string): Promise<'inscrito' | 'cancelado' | null> {
    const inscricao = mockInscricoesDB.find(i => i.eventoId === eventoId && i.userId === userId);
    return inscricao ? inscricao.status : null;
  },

  async listByEvento(eventoId: string): Promise<Inscricao[]> {
    return mockInscricoesDB.filter(i => i.eventoId === eventoId && i.status === 'inscrito');
  },

  async listByUser(userId: string): Promise<Inscricao[]> {
    return mockInscricoesDB.filter(i => i.userId === userId && i.status === 'inscrito');
  },

  async createInscricao(eventoId: string, userId: string): Promise<Inscricao> {
    const newInscricao: Inscricao = {
      id: `ins${Date.now()}`,
      eventoId,
      userId,
      status: 'inscrito',
      createdAt: new Date(),
    };
    mockInscricoesDB.push(newInscricao);
    return newInscricao;
  },

  async cancelInscricao(eventoId: string, userId: string): Promise<void> {
    const index = mockInscricoesDB.findIndex(i => i.eventoId === eventoId && i.userId === userId);
    if (index > -1) {
      mockInscricoesDB[index].status = 'cancelado';
    }
  },

  async countByEvento(eventoId: string): Promise<number> {
    return mockInscricoesDB.filter(i => i.eventoId === eventoId && i.status === 'inscrito').length;
  },
};
