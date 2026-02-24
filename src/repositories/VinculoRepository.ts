import { Vinculo, VinculoStatus } from '@/src/types';
import { mockUsers } from '@/src/data/mock';

const mockVinculosDB: Vinculo[] = [
  {
    id: 1,
    user_id: 'user003',
    user_nome: mockUsers.find(u => u.id === 'user003')?.nome || '',
    user_email: mockUsers.find(u => u.id === 'user003')?.email || '',
    instituicao: 'IFAL',
    campus: 'Maceió',
    perfil_solicitado: 'aluno',
    matricula_ou_siape: '2023987654',
    status: 'pendente',
    created_at: new Date(),
  }
];

export const VinculoRepositoryMock = {
  async listByStatus(status: VinculoStatus): Promise<Vinculo[]> {
    return mockVinculosDB.filter(v => v.status === status);
  },

  async updateStatus(vinculoId: number, status: VinculoStatus): Promise<Vinculo | null> {
    const index = mockVinculosDB.findIndex(v => v.id === vinculoId);
    if (index > -1) {
      mockVinculosDB[index].status = status;
      // Aqui, em uma implementação real, você também atualizaria o status do usuário no DB de usuários.
      return mockVinculosDB[index];
    }
    return null;
  }
};
