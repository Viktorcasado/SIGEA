import { supabase } from '@/src/services/supabase';
import { Inscricao } from '@/src/types';

export const InscricaoRepository = {
  async getStatus(eventId: string, userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar status da inscrição:', error);
        return null;
      }
      return data?.status || null;
    } catch (err) {
      console.error('Erro inesperado ao buscar status:', err);
      return null;
    }
  },

  async listByUser(userId: string): Promise<Inscricao[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erro ao listar inscrições:', error);
      throw error;
    }
    return data || [];
  },

  async create(inscricaoData: { user_id: string; event_id: string }): Promise<Inscricao> {
    // Primeiro verificamos se já existe uma inscrição (mesmo que cancelada)
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', inscricaoData.event_id)
      .eq('user_id', inscricaoData.user_id)
      .maybeSingle();

    if (existing) {
      // Se já existe, apenas atualizamos o status para confirmada
      const { data, error } = await supabase
        .from('event_registrations')
        .update({ status: 'confirmada' })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }

    // Se não existe, criamos uma nova
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: inscricaoData.event_id,
        user_id: inscricaoData.user_id,
        status: 'confirmada'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar inscrição:', error);
      throw error;
    }
    return data;
  },

  async cancel(eventId: string, userId: string): Promise<void> {
    // Em vez de deletar, vamos apenas atualizar o status para cancelada
    // Isso é mais seguro e mantém o histórico
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelada' })
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erro ao cancelar inscrição:', error);
      // Se o update falhar (talvez por falta de política), tentamos o delete como fallback
      const { error: deleteError } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error('Erro ao deletar inscrição:', deleteError);
        throw deleteError;
      }
    }
  }
};