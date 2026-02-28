import { supabase } from '@/src/services/supabase';
import { Certificate, Event } from '@/src/types';

export const CertificateRepository = {
  async validate(code: string): Promise<{ certificate: Certificate; event: Event } | null> {
    const { data, error } = await supabase.rpc('validate_certificate', { p_codigo: code });

    if (error || !data || data.length === 0) {
      console.error('Erro na validação:', error);
      return null;
    }

    const result = data[0];

    const certificate: Certificate = {
      id: result.codigo_certificado,
      evento_titulo: result.evento_titulo,
      nome_participante: '', 
      data_emissao: result.emitido_em,
      codigo_validacao: result.codigo_certificado,
      carga_horaria_minutos: result.carga_horaria_total * 60,
      evento: {
        id: '0', 
        titulo: result.evento_titulo,
        descricao: '',
        instituicao: result.instituicao_sigla,
        campus: result.campus_nome,
        data_inicio: result.emitido_em,
        data_fim: result.emitido_em,
        local: result.campus_nome,
        status: 'publicado',
        modalidade: 'Presencial'
      }
    };

    return {
      certificate,
      event: certificate.evento
    };
  },

  async listByUser(userId: string): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from('certificados')
      .select(`
        *,
        eventos:evento_id (
          id,
          title,
          description,
          date,
          location,
          image_url,
          campus,
          workload
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(item => {
      const eventData = item.eventos;
      const mappedEvent: Event | undefined = eventData ? {
        id: eventData.id,
        titulo: eventData.title,
        descricao: eventData.description,
        data_inicio: eventData.date,
        data_fim: eventData.date,
        local: eventData.location,
        banner_url: eventData.image_url,
        status: 'publicado',
        modalidade: 'Presencial',
        campus: eventData.campus,
        instituicao: 'IFAL',
        vagas: 0
      } : undefined;

      return {
        id: item.id,
        evento_titulo: mappedEvent?.titulo || 'Evento Desconhecido',
        nome_participante: '', 
        data_emissao: item.emitido_em,
        codigo_validacao: item.codigo_certificado, // Usando o código formatado pelo trigger
        carga_horaria_minutos: (item.carga_horaria || eventData?.workload || 0) * 60,
        evento: mappedEvent
      };
    });
  },

  async findByEventAndUser(eventId: string | number, userId: string): Promise<Certificate | null> {
    const { data, error } = await supabase
      .from('certificados')
      .select(`
        *,
        eventos:evento_id (
          id,
          title,
          description,
          date,
          location,
          image_url,
          campus,
          workload
        )
      `)
      .eq('evento_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    const eventData = data.eventos;
    const mappedEvent: Event = {
      id: eventData.id,
      titulo: eventData.title,
      descricao: eventData.description,
      data_inicio: eventData.date,
      data_fim: eventData.date,
      local: eventData.location,
      banner_url: eventData.image_url,
      status: 'publicado',
      modalidade: 'Presencial',
      campus: eventData.campus,
      instituicao: 'IFAL',
      vagas: 0
    };

    return {
      id: data.id,
      evento_titulo: mappedEvent.titulo,
      nome_participante: '',
      data_emissao: data.emitido_em,
      codigo_validacao: data.codigo_certificado,
      carga_horaria_minutos: (data.carga_horaria || eventData?.workload || 0) * 60,
      evento: mappedEvent
    };
  }
};