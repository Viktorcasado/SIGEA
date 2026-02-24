import { supabase } from '@/src/services/supabase';
import { Activity } from '@/src/types';

export const ActivityRepository = {
  async listByEvent(eventId: string | number): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('event_id', eventId);
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      event_id: item.event_id,
      titulo: item.title,
      descricao: item.description,
      tipo: item.type,
      data: item.date,
      hora_inicio: item.start_time,
      hora_fim: item.end_time,
      local: item.location,
      carga_horaria_minutos: (item.hours || 0) * 60
    }));
  },

  async create(activityData: any): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        event_id: activityData.event_id,
        title: activityData.titulo,
        description: activityData.descricao,
        type: activityData.tipo,
        date: activityData.data,
        start_time: activityData.hora_inicio,
        end_time: activityData.hora_fim,
        location: activityData.local,
        hours: (activityData.carga_horaria_minutos || 0) / 60
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};