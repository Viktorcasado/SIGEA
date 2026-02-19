"use client";

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useUser } from '@/src/contexts/UserContext';
import { supabase } from '@/src/integrations/supabase/client';
import { Event } from '@/src/types';
import { ArrowLeft, Share2, Calendar, MapPin, Award, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { addNotification } = useNotifications();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventData) {
        setEvent({
          id: eventData.id,
          titulo: eventData.title,
          descricao: eventData.description || '',
          dataInicio: new Date(eventData.date),
          local: eventData.location || '',
          campus: eventData.campus || '',
          instituicao: 'IFAL',
          modalidade: 'Presencial',
          status: 'publicado',
          vagas: eventData.workload
        });

        if (user) {
          const { data: regData } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (regData) setIsSubscribed(true);

          const { data: certData } = await supabase
            .from('certificados')
            .select('id')
            .eq('evento_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (certData) setHasCertificate(true);
        }
      }
      setLoading(false);
    };

    fetchEventData();
  }, [id, user]);

  const handleSubscription = async () => {
    if (!user || !event) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: event.id,
        user_id: user.id,
        status: 'confirmada'
      });

    if (!error) {
      setIsSubscribed(true);
      addNotification({
        titulo: 'Inscrição Realizada',
        mensagem: `Sua vaga no evento "${event.titulo}" está garantida!`,
        tipo: 'evento',
        referenciaId: event.id,
      });
    }
    setSubmitting(false);
  };

  const handleIssueCertificate = async () => {
    if (!user || !event) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('certificados')
      .insert({
        evento_id: event.id,
        user_id: user.id,
        codigo_validacao: Math.random().toString(36).substring(2, 10).toUpperCase()
      });

    if (!error) {
      setHasCertificate(true);
      addNotification({
        titulo: 'Certificado Disponível',
        mensagem: `O certificado do evento "${event.titulo}" foi gerado com sucesso!`,
        tipo: 'certificado',
      });
      alert('Certificado gerado! Você pode visualizá-lo na aba de Certificados.');
    } else {
      alert('Erro ao gerar certificado.');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!event) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Evento não encontrado</h2></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
            <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{event.titulo}</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Data</p>
                        <p className="font-bold text-gray-800">{event.dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Local</p>
                        <p className="font-bold text-gray-800">{event.local || event.campus}</p>
                    </div>
                </div>
            </div>

            <div className="prose max-w-none text-gray-600 leading-relaxed mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sobre o evento</h3>
                <p>{event.descricao}</p>
            </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            {!isSubscribed ? (
                <button 
                    onClick={handleSubscription}
                    disabled={submitting}
                    className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-indigo-300"
                >
                    {submitting ? 'Processando...' : 'Garantir minha vaga'}
                </button>
            ) : hasCertificate ? (
                <Link 
                    to="/certificados"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all"
                >
                    <Award className="w-5 h-5" />
                    Ver Certificado
                </Link>
            ) : (
                <button 
                    onClick={handleIssueCertificate}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <CheckCircle className="w-5 h-5" />
                    Emitir Certificado
                </button>
            )}
            <button className="px-6 py-4 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                Compartilhar
            </button>
        </div>
      </div>
    </motion.div>
  );
}