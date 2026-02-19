import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Inscricao, Event } from '@/src/types';
import { InscricaoRepositoryMock } from '@/src/repositories/InscricaoRepository';
import { mockEvents } from '@/src/data/mock';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function UserInscriptionsPage() {
  const { user } = useUser();
  const [inscriptions, setInscriptions] = useState<Inscricao[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (user) {
      InscricaoRepositoryMock.listByUser(user.id).then(userInscriptions => {
        setInscriptions(userInscriptions);
        const subscribedEventIds = userInscriptions.map(i => i.eventoId);
        const subscribedEvents = mockEvents.filter(e => subscribedEventIds.includes(e.id));
        setEvents(subscribedEvents);
      });
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">Meus Eventos Inscritos</h1>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg mt-8">
            <Calendar className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Nenhuma inscrição encontrada</h2>
            <p className="mt-1 text-gray-500">Você ainda não se inscreveu em nenhum evento.</p>
            <Link to="/explorar" className="mt-6 inline-block bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg">
                Explorar Eventos
            </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {events.map(event => (
            <Link to={`/evento/${event.id}`} key={event.id} className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg text-gray-800">{event.titulo}</h3>
              <p className="text-sm text-gray-500">{event.instituicao} - {event.campus}</p>
              <p className="text-sm text-gray-600 mt-1">{new Date(event.dataInicio).toLocaleDateString('pt-BR')}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
