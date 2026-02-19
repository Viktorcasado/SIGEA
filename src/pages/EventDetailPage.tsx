import { useState, useContext } from 'react';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockEvents } from '@/src/data/mock';
import { ArrowLeft, Share2, Calendar, MapPin } from 'lucide-react';

// Combine all events to find the one we're looking for
const allEvents = mockEvents;

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const event = allEvents.find(e => e.id === id);

  const isSubscribed = false; // Placeholder, as mockMeusEventos is being refactored
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribedState, setIsSubscribedState] = useState(isSubscribed);
  const { addNotification } = useNotifications();

  const handleSubscription = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribedState(true);
      setIsLoading(false);
      if (event) {
        addNotification({
          titulo: 'Inscrição Confirmada',
          mensagem: `Você se inscreveu no evento \"${event.titulo}\".`,
          tipo: 'evento',
          referenciaId: event.id,
        });
      }
    }, 1000);
  };

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Evento não encontrado</h2>
        <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.titulo}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-500 mb-6">
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{event.dataInicio.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{event.local}</span>
                </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{event.descricao}</p>
        </div>
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            {isSubscribedState ? (
                <button disabled className="w-full text-center px-6 py-3 rounded-lg bg-green-100 text-green-800 font-semibold">
                    Você já está inscrito
                </button>
            ) : (
                <button 
                    onClick={handleSubscription}
                    disabled={isLoading}
                    className="w-full text-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                >
                    {isLoading ? 'Inscrevendo...' : 'Inscrever-se'}
                </button>
            )}
            <button className="w-full sm:w-auto text-center px-6 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center">
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar
            </button>
        </div>
      </div>
    </div>
  );
}
