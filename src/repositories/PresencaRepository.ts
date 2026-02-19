import { Presenca } from '@/src/types';
import { ActivityRepositoryMock } from './ActivityRepository';

const mockPresencasDB: Presenca[] = [];

export const PresencaRepositoryMock = {
  async listByAtividade(atividadeId: string): Promise<Presenca[]> {
    return mockPresencasDB.filter(p => p.atividadeId === atividadeId);
  },

  async setPresenca(data: { atividadeId: string; userId: string; presente: boolean; marcadoPor: string }[]): Promise<void> {
    data.forEach(item => {
      const index = mockPresencasDB.findIndex(p => p.atividadeId === item.atividadeId && p.userId === item.userId);
      if (index > -1) {
        mockPresencasDB[index].presente = item.presente;
      } else {
        mockPresencasDB.push({
          id: `pre${Date.now()}${Math.random()}`,
          ...item,
          createdAt: new Date(),
        });
      }
    });
  },

  async listByUser(userId: string): Promise<Presenca[]> {
    return mockPresencasDB.filter(p => p.userId === userId);
  },

  async calcularCargaHoraria(eventoId: string, userId: string): Promise<number> {
    const presencas = mockPresencasDB.filter(p => p.userId === userId && p.presente);
    const atividadesDoEvento = await ActivityRepositoryMock.listByEvent(eventoId);
    
    let totalMinutos = 0;
    presencas.forEach(presenca => {
      const atividade = atividadesDoEvento.find(a => a.id === presenca.atividadeId);
      if (atividade) {
        totalMinutos += atividade.cargaHorariaMinutos;
      }
    });
    return totalMinutos;
  },
};
