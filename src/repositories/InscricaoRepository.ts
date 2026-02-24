import { supabase } from '@/src/services/supabase';
import { Inscricao } from '@/src/types';

export const InscricaoRepository = {
  async getStatus(eventId: string, userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) return null;
    return data?.status || null;
  },

  async create(inscricaoData: { user_id: string; event_id: string }): Promise<Inscricao> {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: inscricaoData.event_id,
        user_id: inscricaoData.user_id,
        status: 'confirmada'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async cancel(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};