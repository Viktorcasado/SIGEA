"use client";

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useUser } from '@/src/contexts/UserContext';
import { useToast } from '@/src/contexts/ToastContext';
import { supabase } from '@/src/integrations/supabase/client';
import { Event } from '@/src/types';
import { ArrowLeft, Share2, Calendar, MapPin, Award, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { shareContent, formatEventShare } from '@/src/utils/share';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const { showToast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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
          vagas: eventData.workload,
          organizer_id: eventData.organizer_id,
          carga_horaria: eventData.workload || 0
        });

        if (user) {
          const { data: regData } = await supabase
            .from('event_registrations')
            .select('id, registered_at')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (regData) {
            setIsSubscribed(true);
            setRegistrationDate(new Date(regData.registered_at));
          }

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getMinutesRemaining = () => {
    if (!registrationDate) return 0;
    const diffMs = currentTime.getTime() - registrationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return Math.max(0, 10 - diffMins);
  };

  const canIssueCertificate = () => {
    if (!registrationDate) return false;
    const diffMs = currentTime.getTime() - registrationDate.getTime();
    return diffMs >= 10 * 60 * 1000;
  };

  const handleSubscription = async () => {
    if (!user) {
      showToast('Você precisa estar logado para se inscrever.', 'error');
      navigate('/login');
      return;
    }
    
    if (!event) return;
    setSubmitting(true);

    const now = new Date();
    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: event.id,
        user_id: user.id,
        status: 'confirmada',
        registered_at: now.toISOString()
      });

    if (!error) {
      setIsSubscribed(true);
      setRegistrationDate(now);
      addNotification({
        titulo: 'Inscrição Realizada',
        mensagem: `Sua vaga no evento "${event.titulo}" está garantida! Comprovante enviado para ${user.email}.`,
        tipo: 'evento',
        referenciaId: event.id,
      });
      showToast('Inscrição realizada! Comprovante enviado por e-mail.');
    } else {
      showToast('Erro ao realizar inscrição.', 'error');
    }
    setSubmitting(false);
  };

  const handleCancelSubscription = async () => {
    if (!user || !event || !window.confirm('Deseja realmente cancelar sua inscrição?')) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', event.id)
      .eq('user_id', user.id);

    if (!error) {
      setIsSubscribed(false);
      setRegistrationDate(null);
      showToast('Inscrição cancelada com sucesso.');
    } else {
      showToast('Erro ao cancelar inscrição.', 'error');
    }
    setSubmitting(false);
  };

  const handleIssueCertificate = async () => {
    if (!user || !event || !canIssueCertificate()) return;
    setSubmitting(true);

    const validationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const fallbackCertCode = `SIGEA-${event.id.substring(0,4)}-${new Date().getFullYear().toString().slice(-2)}`;

    const { error } = await supabase
      .from('certificados')
      .insert({
        evento_id: event.id,
        user_id: user.id,
        codigo_validacao: validationCode,
        codigo_certificado: fallbackCertCode
      });

    if (!error) {
      setHasCertificate(true);
      addNotification({
        titulo: 'Certificado Disponível',
        mensagem: `O certificado do evento "${event.titulo}" foi gerado com sucesso!`,
        tipo: 'certificado',
      });
      showToast('Certificado gerado com sucesso!');
    } else {
      showToast('Erro ao gerar certificado.', 'error');
    }
    setSubmitting(false);
  };

  const onShare = () => {
    if (event) shareContent(formatEventShare(event), showToast);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!event) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Evento não encontrado</h2></div>;

  const isOrganizer = user?.id === event.organizer_id;
  const minutesLeft = getMinutesRemaining();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-6 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <div className="flex gap-2">
          {isOrganizer && (
            <Link to={`/gestor/eventos/${event.id}/certificado-template`} className="p-2.5 bg-white border border-gray-200 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Certificado</span>
            </Link>
          )}
          <button onClick={onShare} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-indigo-600 transition-all shadow-sm">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
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
                <button onClick={handleSubscription} disabled={submitting} className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-indigo-300">
                    {submitting ? 'Processando...' : 'Garantir minha vaga'}
                </button>
            ) : hasCertificate ? (
                <Link to="/certificados" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all">
                    <Award className="w-5 h-5" />
                    Ver Certificado
                </Link>
            ) : (
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    {!canIssueCertificate() ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                            <div className="flex items-center gap-2 text-amber-700 font-bold mb-1">
                                <Clock className="w-5 h-5" />
                                Certificado em processamento
                            </div>
                            <p className="text-xs text-amber-600">Disponível em {minutesLeft} min</p>
                        </div>
                    ) : (
                        <button onClick={handleIssueCertificate} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all">
                            <CheckCircle className="w-5 h-5" />
                            Emitir Certificado
                        </button>
                    )}
                    <button onClick={handleCancelSubscription} disabled={submitting} className="px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Cancelar Inscrição
                    </button>
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
}