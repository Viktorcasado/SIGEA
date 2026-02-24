import { Activity } from '@/src/types';

const mockActivitiesDB: Record<number, Activity[]> = {
  1: [
    {
      id: 1,
      event_id: 1,
      titulo: 'Abertura e Boas-vindas',
      tipo: 'palestra',
      data: '2026-02-20',
      hora_inicio: '09:00',
      hora_fim: '10:00',
      local: 'Auditório Principal',
      descricao: 'Direção do Campus',
      carga_horaria_minutos: 60,
    },
    {
      id: 2,
      event_id: 1,
      titulo: 'Introdução ao React com TypeScript',
      tipo: 'oficina',
      data: '2026-02-20',
      hora_inicio: '10:30',
      hora_fim: '12:30',
      local: 'Laboratório 5',
      descricao: 'Prof. João Dev',
      carga_horaria_minutos: 120,
    },
  ]
};

export const ActivityRepositoryMock = {
  async listByEvent(eventId: number): Promise<Activity[]> {
    return mockActivitiesDB[eventId] || [];
  },

  async createActivity(eventId: number, activityData: Omit<Activity, 'id'>): Promise<Activity> {
    if (!mockActivitiesDB[eventId]) {
      mockActivitiesDB[eventId] = [];
    }
    const newActivity: Activity = {
      ...activityData,
      id: Math.floor(Math.random() * 10000),
    };
    mockActivitiesDB[eventId].push(newActivity);
    return newActivity;
  },

  async updateActivity(updatedActivity: Activity): Promise<Activity> {
    const eventActivities = mockActivitiesDB[updatedActivity.event_id];
    if (!eventActivities) throw new Error('Event not found');
    const index = eventActivities.findIndex(a => a.id === updatedActivity.id);
    if (index === -1) throw new Error('Activity not found');
    eventActivities[index] = updatedActivity;
    return updatedActivity;
  },

  async deleteActivity(eventId: number, activityId: number): Promise<void> {
    const eventActivities = mockActivitiesDB[eventId];
    if (!eventActivities) return;
    mockActivitiesDB[eventId] = eventActivities.filter(a => a.id !== activityId);
  },
};
