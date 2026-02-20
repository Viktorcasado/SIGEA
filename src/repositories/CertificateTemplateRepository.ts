"use client";

import { supabase } from '@/src/integrations/supabase/client';
import { CertificateTemplate, CertificateMapping } from '@/src/types';

export const CertificateTemplateRepository = {
  async getByEvent(eventId: string): Promise<CertificateTemplate | null> {
    const { data, error } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async saveTemplate(eventId: string, filePath: string, type: 'pdf' | 'image'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { error } = await supabase
      .from('certificate_templates')
      .upsert({
        event_id: eventId,
        template_file_path: filePath,
        template_type: type,
        created_by: user.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'event_id' });

    if (error) throw error;
  },

  async updateMapping(eventId: string, mapping: CertificateMapping): Promise<void> {
    const { error } = await supabase
      .from('certificate_templates')
      .update({ mapping })
      .eq('event_id', eventId);

    if (error) throw error;
  }
};