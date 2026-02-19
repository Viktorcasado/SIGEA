"use client";

import { Certificate, Event } from '@/src/types';
import { supabase } from '@/src/integrations/supabase/client';

export const CertificateRepository = {
  async validate(code: string): Promise<{ certificate: Certificate; event: Event } | null> {
    // Busca o certificado no Supabase pelo código
    const { data, error } = await supabase
      .from('certificados')
      .select(`
        *,
        events:evento_id (*)
      `)
      .eq('codigo_certificado', code.trim())
      .maybeSingle();

    if (error || !data) return null;

    const certificate: Certificate = {
      id: data.id,
      userId: data.user_id,
      eventoId: data.evento_id,
      codigo: data.codigo_certificado,
      dataEmissao: new Date(data.emitido_em)
    };

    const event: Event = {
      id: data.events.id,
      titulo: data.events.title,
      descricao: data.events.description || '',
      dataInicio: new Date(data.events.date),
      local: data.events.location || '',
      campus: data.events.campus || '',
      instituicao: 'IFAL',
      modalidade: 'Presencial',
      status: 'publicado',
      vagas: data.events.workload || 0
    };

    return { certificate, event };
  }
};