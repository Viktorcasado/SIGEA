import { Event } from '@/src/types';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle, Zap, Clock, Users, Star, Tv, Footprints } from 'lucide-react';

interface EventCardProps {
  event: Event;
  variant?: 'horizontal' | 'vertical' | 'list';
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
}

const StatusBadge = ({ status }: { status: Event['status'] }) => {
  if (!status) return null;
  const statusInfo = {
    'rascunho': { icon: <Zap className="w-3 h-3 mr-1.5" />, color: 'bg-yellow-100 text-yellow-800', text: 'Rascunho' },
    'publicado': { icon: <CheckCircle className="w-3 h-3 mr-1.5" />, color: 'bg-blue-100 text-blue-800', text: 'Publicado' },
    'encerrado': { icon: <Clock className="w-3 h-3 mr-1.5" />, color: 'bg-gray-100 text-gray-800', text: 'Encerrado' },
  };
  const currentStatus = statusInfo[status] || { icon: null, color: 'bg-gray-100 text-gray-800', text: 'Indefinido' };
  return <div className={`text-xs inline-flex items-center font-semibold px-2.5 py-0.5 rounded-full ${currentStatus.color}`}>{currentStatus.icon}{currentStatus.text}</div>;
};

const ModalityIcon = ({ modality }: { modality: Event['modalidade'] }) => {
    const icons = {
        'Presencial': <Footprints className="w-4 h-4 mr-1.5 text-gray-400" />,
        'Online': <Tv className="w-4 h-4 mr-1.5 text-gray-400" />,
        'Híbrido': <><Footprints className="w-3 h-3 mr-0.5 text-gray-400" /><Tv className="w-3 h-3 mr-1.5 text-gray-400" /></>,
    }
    return <div className="flex items-center">{icons[modality]} {modality}</div>;
}

export default function EventCard({ event, variant = 'horizontal', isFavorite, onToggleFavorite }: EventCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the favorite button
    e.stopPropagation();
    onToggleFavorite?.(event.id);
  };

  if (variant === 'list') {
    return (
        <div className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start gap-4">
                <Link to={`/evento/${event.id}`} className='flex-grow'>
                    <h3 className="font-bold text-gray-800 text-lg">{event.titulo}</h3>
                    <p className="text-sm text-gray-500 mt-1.5">{event.instituicao} - {event.campus}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-3">
                        <div className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-gray-400" /> {event.dataInicio.toLocaleDateString('pt-BR')}</div>
                        <ModalityIcon modality={event.modalidade} />
                        {event.vagas != null && event.vagas > 0 && <div className="flex items-center"><Users className="w-4 h-4 mr-1.5 text-gray-400" /> {event.vagas} vagas</div>}
                    </div>
                </Link>
                {onToggleFavorite && (
                    <button onClick={handleFavoriteClick} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <Star className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                )}
            </div>
        </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <Link to={`/evento/${event.id}`} className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800">{event.titulo}</h3>
            <p className="text-sm text-gray-500 mt-1">{event.campus}</p>
          </div>
          {event.status && <StatusBadge status={event.status} />}
        </div>
      </Link>
    );
  }

  // Horizontal variant (for HomePage)
  return (
    <Link to={`/evento/${event.id}`} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 mr-4">
      <div className="p-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6 text-gray-500" />
        </div>
        <p className="text-sm font-semibold text-indigo-600">{event.dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}</p>
        <h3 className="font-semibold text-gray-800 mt-1">{event.titulo}</h3>
        <p className="text-sm text-gray-500 flex items-center mt-2">
          <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
          {event.campus}
        </p>
      </div>
    </Link>
  );
}
