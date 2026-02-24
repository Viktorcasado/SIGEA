import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Inscricao, Event, Certificate } from '@/src/types';
import { InscricaoRepository } from '@/src/repositories/InscricaoRepository';
import { EventRepository } from '@/src/repositories/EventRepository';
import { CertificateRepository } from '@/src/repositories/CertificateRepository';
import { ArrowLeft, Calendar, Award, Download, ChevronRight } from 'lucide-react';

export default function UserInscriptionsPage() {
  const { user } = useUser();
  const [events, setEvents] = useState<(Event & { certificate?: Certificate })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const userInscriptions = await InscricaoRepository.listByUser(user.id);
          const subscribedEventIds = userInscriptions.map(i => i.event_id);
          
          if (subscribedEventIds.length > 0) {
            const eventsData = await EventRepository.listByIds(subscribedEventIds);
            const certificates = await CertificateRepository.listByUser(user.id);

            const eventsWithCerts = eventsData.map(event => ({
              ...event,
              certificate: certificates.find(c => c.evento?.id === event.id || c.evento_titulo === event.titulo)
            }));

            setEvents(eventsWithCerts);
          } else {
            setEvents([]);
          }
        } catch (err) {
          console.error('Erro ao carregar inscrições:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-bold mb-8 group">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
        </div>
        Voltar para o Perfil
      </Link>

      <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-8">Eventos e Inscrições</h1>

      {loading ? (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Nenhuma inscrição encontrada</h2>
            <p className="mt-2 text-gray-500 font-bold max-w-xs mx-auto">Você ainda não se inscreveu em nenhum evento acadêmico.</p>
            <Link to="/explorar" className="mt-8 inline-flex items-center gap-2 bg-indigo-600 text-white font-black px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                Explorar Eventos
            </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <Link to={`/evento/${event.id}`} className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="font-black text-lg text-gray-900 tracking-tight leading-tight">{event.titulo}</h3>
                    </div>
                    <p className="text-sm font-bold text-gray-400 ml-13">{event.instituicao} • {event.campus}</p>
                    <p className="text-sm font-bold text-gray-600 mt-2 ml-13">{new Date(event.data_inicio).toLocaleDateString('pt-BR')}</p>
                </Link>
                
                <div className="flex items-center gap-3">
                    {event.certificate ? (
                        <Link 
                            to="/certificados"
                            className="flex items-center gap-2 px-5 py-3 bg-green-50 text-green-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-green-100 transition-colors"
                        >
                            <Award className="w-4 h-4" />
                            Certificado Disponível
                        </Link>
                    ) : (
                        <span className="px-5 py-3 bg-gray-50 text-gray-400 font-black text-xs uppercase tracking-widest rounded-xl">
                            Inscrito
                        </span>
                    )}
                    <Link to={`/evento/${event.id}`} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-indigo-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}