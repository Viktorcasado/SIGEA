import React, { useState } from 'react';
import { Event } from '../types';
import Icon from './Icon';
import Logo from './Logo';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const [imageError, setImageError] = useState(false);

  // Formatação de Data Real: "25 de Janeiro às 01:48"
  const formatEventDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date).replace(',', ' às');
    } catch {
        return dateStr;
    }
  };

  return (
    <button 
      onClick={onClick} 
      className="relative w-72 h-96 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl text-left transition-transform active:scale-[0.98] group"
    >
      <div className="absolute inset-0 bg-white dark:bg-gray-800 flex items-center justify-center">
        {(!event.imageUrl || imageError) ? (
            <Logo 
                className="w-32"
            />
        ) : (
            <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover" 
                onError={() => setImageError(true)} 
            />
        )}
      </div>
      
      {/* Overlay com gradiente de alta qualidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
      
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="bg-ifal-green text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">
            {(event.category || 'EVENTO')}
          </span>
        </div>
        
        <div className="text-white space-y-2">
          <div className="flex items-center space-x-1.5 text-ifal-green font-bold text-[13px]">
            <Icon name="calendar" className="w-4 h-4" />
            <span className="capitalize">{formatEventDate(event.date)}</span>
          </div>
          <h3 className="text-2xl font-bold leading-[1.1] tracking-tight group-hover:text-ifal-green transition-colors line-clamp-2">
            {event.title}
          </h3>
          <div className="flex items-center space-x-1.5 text-gray-300 text-xs font-semibold uppercase tracking-wider">
            <Icon name="location" className="w-3.5 h-3.5" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default EventCard;