import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EventRepository } from '@/src/repositories/EventRepository';
import { InscricaoRepository } from '@/src/repositories/InscricaoRepository';
import { CertificateRepository } from '@/src/repositories/CertificateRepository';
import { Event, Certificate } from '@/src/types';
import { useUser } from '@/src/contexts/UserContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { ArrowLeft, Share2, Calendar, MapPin, CheckCircle, XCircle, Award, Download, Clock, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { addNotification } = useNotifications();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchEventData = async () => {
      try {
        setLoading(true);
        const eventData = await EventRepository.findById(id);
        if (!eventData) {
          setError('Evento não encontrado.');
          return;
        }
        setEvent(eventData);

        if (user) {
          const status = await InscricaoRepository.getStatus(id, user.id);
          setIsSubscribed(status === 'confirmada');
          
          const cert = await CertificateRepository.findByEventAndUser(id, user.id);
          setCertificate(cert);
        }
      } catch (err) {
        setError('Não foi possível carregar o evento.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, user]);

  const handleSubscription = async () => {
    if (!user || !event) return;

    setIsSubscriptionLoading(true);
    try {
      if (isSubscribed) {
        await InscricaoRepository.cancel(event.id, user.id);
        setIsSubscribed(false);
        addNotification({
          titulo: 'Inscrição Cancelada',
          mensagem: `Sua inscrição no evento "${event.titulo}" foi cancelada.`,
          tipo: 'sistema',
        });
      } else {
        await InscricaoRepository.create({
          user_id: user.id,
          event_id: event.id
        });
        setIsSubscribed(true);
        addNotification({
          titulo: 'Inscrição Confirmada',
          mensagem: `Você se inscreveu no evento "${event.titulo}".`,
          tipo: 'evento',
          referenciaId: event.id.toString(),
        });
      }
    } catch (err: any) {
      console.error('Erro na operação de inscrição:', err);
      addNotification({
        titulo: 'Erro na Operação',
        mensagem: err.message || 'Não foi possível processar sua solicitação. Verifique sua conexão ou permissões.',
        tipo: 'sistema',
      });
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-bold">Carregando detalhes...</p>
    </div>
  );

  if (error || !event) return (
    <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
        <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{error || 'Evento não encontrado'}</h2>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 text-indigo-600 font-black hover:underline">
            <ArrowLeft className="w-5 h-5" /> Voltar ao Início
        </Link>
    </div>
  );

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-12"
    >
      <header>
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 font-bold group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Voltar
        </button>
      </header>

      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 lg:p-12">
            <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {event.modalidade}
                </span>
                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {event.campus}
                </span>
            </div>

            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">{event.titulo}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data do Evento</p>
                        <p className="font-bold text-gray-900">{new Date(event.data_inicio).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <MapPin className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Localização</p>
                        <p className="font-bold text-gray-900">{event.local}</p>
                    </div>
                </div>
            </div>

            <div className="prose prose-indigo max-w-none">
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4">Sobre o evento</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{event.descricao}</p>
            </div>
        </div>

        <div className="p-8 lg:p-12 bg-gray-50 border-t border-gray-100">
            {certificate ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-green-600 rounded-[2rem] text-white shadow-lg shadow-green-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl tracking-tight">Certificado Disponível!</h3>
                            <p className="text-white/80 font-bold text-sm">Você concluiu este evento com sucesso.</p>
                        </div>
                    </div>
                    <Link 
                        to="/certificados"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-green-700 font-black rounded-2xl hover:bg-green-50 transition-all active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        Ver Certificado
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                    {isSubscribed ? (
                        <button 
                            onClick={handleSubscription}
                            disabled={isSubscriptionLoading}
                            className="flex-grow flex items-center justify-center gap-3 px-8 py-5 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <XCircle className="w-6 h-6"/> 
                            {isSubscriptionLoading ? 'Cancelando...' : 'Cancelar Inscrição'}
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubscription}
                            disabled={isSubscriptionLoading}
                            className="flex-grow flex items-center justify-center gap-3 px-8 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:bg-indigo-400"
                        >
                            <CheckCircle className="w-6 h-6"/> 
                            {isSubscriptionLoading ? 'Inscrevendo...' : 'Inscrever-se agora'}
                        </button>
                    )}
                    <button className="flex items-center justify-center gap-3 px-8 py-5 bg-white border border-gray-200 text-gray-600 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95">
                        <Share2 className="w-6 h-6" />
                        Compartilhar
                    </button>
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
}