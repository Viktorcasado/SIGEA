import { Vinculo, VinculoStatus } from '@/src/types';
import { mockUsers } from '@/src/data/mock';

const mockVinculosDB: Vinculo[] = [
  {
    id: 'vnc01',
    userId: 'user003',
    userNome: mockUsers.find(u => u.id === 'user003')?.nome || '',
    userEmail: mockUsers.find(u => u.id === 'user003')?.email || '',
    instituicao: 'IFAL',
    campus: 'Maceió',
    perfilSolicitado: 'aluno',
    matriculaOuSiape: '2023987654',
    status: 'pendente',
    createdAt: new Date(),
  }
];

export const VinculoRepositoryMock = {
  async listByStatus(status: VinculoStatus): Promise<Vinculo[]> {
    return mockVinculosDB.filter(v => v.status === status);
  },

  async updateStatus(vinculoId: string, status: VinculoStatus): Promise<Vinculo | null> {
    const index = mockVinculosDB.findIndex(v => v.id === vinculoId);
    if (index > -1) {
      mockVinculosDB[index].status = status;
      // Aqui, em uma implementação real, você também atualizaria o status do usuário no DB de usuários.
      return mockVinculosDB[index];
    }
    return null;
  }
};
