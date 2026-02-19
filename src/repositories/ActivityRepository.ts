import { Activity } from '@/src/types';

// Mock database for activities, keyed by eventId
const mockActivitiesDB: Record<string, Activity[]> = {
  'evt01': [
    {
      id: 'act01',
      eventoId: 'evt01',
      titulo: 'Abertura e Boas-vindas',
      tipo: 'palestra',
      data: '2026-02-20',
      horaInicio: '09:00',
      horaFim: '10:00',
      localOuLink: 'Auditório Principal',
      responsavel: 'Direção do Campus',
      cargaHorariaMinutos: 60,
    },
    {
      id: 'act02',
      eventoId: 'evt01',
      titulo: 'Introdução ao React com TypeScript',
      tipo: 'oficina',
      data: '2026-02-20',
      horaInicio: '10:30',
      horaFim: '12:30',
      localOuLink: 'Laboratório 5',
      responsavel: 'Prof. João Dev',
      cargaHorariaMinutos: 120,
    },
  ]
};

// Mock Repository Implementation
export const ActivityRepositoryMock = {
  async listByEvent(eventoId: string): Promise<Activity[]> {
    return mockActivitiesDB[eventoId] || [];
  },

  async createActivity(eventoId: string, activityData: Omit<Activity, 'id' | 'eventoId'>): Promise<Activity> {
    if (!mockActivitiesDB[eventoId]) {
      mockActivitiesDB[eventoId] = [];
    }
    const newActivity: Activity = {
      ...activityData,
      id: `act${Date.now()}`,
      eventoId,
    };
    mockActivitiesDB[eventoId].push(newActivity);
    return newActivity;
  },

  async updateActivity(updatedActivity: Activity): Promise<Activity> {
    const eventActivities = mockActivitiesDB[updatedActivity.eventoId];
    if (!eventActivities) throw new Error('Event not found');
    const index = eventActivities.findIndex(a => a.id === updatedActivity.id);
    if (index === -1) throw new Error('Activity not found');
    eventActivities[index] = updatedActivity;
    return updatedActivity;
  },

  async deleteActivity(eventoId: string, activityId: string): Promise<void> {
    const eventActivities = mockActivitiesDB[eventoId];
    if (!eventActivities) return;
    mockActivitiesDB[eventoId] = eventActivities.filter(a => a.id !== activityId);
  },
};
