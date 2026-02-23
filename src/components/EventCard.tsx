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
    'rascunho': { icon: <Zap className="w-3 h-3 mr-1.5" />, color: 'bg-yellow-400/20 text-yellow-900', text: 'Rascunho' },
    'publicado': { icon: <CheckCircle className="w-3 h-3 mr-1.5" />, color: 'bg-indigo-400/20 text-indigo-900', text: 'Publicado' },
    'encerrado': { icon: <Clock className="w-3 h-3 mr-1.5" />, color: 'bg-gray-400/20 text-gray-900', text: 'Encerrado' },
  };
  const currentStatus = statusInfo[status] || { icon: null, color: 'bg-gray-400/20 text-gray-900', text: 'Indefinido' };
  return <div className={`text-[10px] inline-flex items-center font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/20 ${currentStatus.color}`}>{currentStatus.icon}{currentStatus.text}</div>;
};

export default function EventCard({ event, variant = 'horizontal', isFavorite, onToggleFavorite }: EventCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(event.id);
  };

  if (variant === 'list') {
    return (
        <div className="glass-card p-6 rounded-3xl group">
            <div className="flex justify-between items-start gap-4">
                <Link to={`/evento/${event.id}`} className='flex-grow'>
                    <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={event.status} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.instituicao}</span>
                    </div>
                    <h3 className="font-black text-gray-900 text-xl group-hover:text-indigo-600 transition-colors">{event.titulo}</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-gray-500 mt-4">
                        <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-indigo-500" /> {event.dataInicio.toLocaleDateString('pt-BR')}</div>
                        <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-indigo-500" /> {event.campus}</div>
                        <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-indigo-500" /> {event.carga_horaria}h</div>
                    </div>
                </Link>
                {onToggleFavorite && (
                    <button onClick={handleFavoriteClick} className="p-3 rounded-2xl bg-white/40 hover:bg-white/60 transition-all">
                        <Star className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                )}
            </div>
        </div>
    );
  }

  return (
    <Link to={`/evento/${event.id}`} className="flex-shrink-0 w-72 glass-card rounded-[2.5rem] p-6 group">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Calendar className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="absolute top-0 right-0">
          <StatusBadge status={event.status} />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
          {event.dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </p>
        <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{event.titulo}</h3>
      </div>

      <div className="mt-6 pt-6 border-t border-black/5 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-500 flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
          {event.campus}
        </p>
        <span className="text-[10px] font-black text-gray-400 bg-black/5 px-2 py-1 rounded-lg">{event.carga_horaria}H</span>
      </div>
    </Link>
  );
}