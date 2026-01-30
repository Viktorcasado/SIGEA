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
      className="relative w-72 h-96 rounded-lg overflow-hidden flex-shrink-0 shadow-sm hover:shadow-md border border-gray-100 text-left transition-all active:scale-[0.98] group bg-white animate-fade"
    >
      <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
        {(!event.imageUrl || imageError) ? (
            <Logo className="w-24 opacity-20 grayscale" />
        ) : (
            <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                onError={() => setImageError(true)} 
            />
        )}
      </div>
      
      {/* Overlay Profissional Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
      
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="bg-[#2e7d32] text-white text-[9px] font-black px-2.5 py-1 rounded-[4px] uppercase tracking-widest shadow-lg">
            {(event.category || 'EVENTO')}
          </span>
        </div>
        
        <div className="text-white space-y-2">
          <div className="flex items-center space-x-1.5 text-green-400 font-bold text-[12px]">
            <Icon name="calendar" className="w-3.5 h-3.5" />
            <span className="capitalize">{formatEventDate(event.date)}</span>
          </div>
          <h3 className="text-xl font-bold leading-tight tracking-tight group-hover:text-green-400 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <div className="flex items-center space-x-1.5 text-gray-300 text-[10px] font-bold uppercase tracking-wider">
            <Icon name="location" className="w-3 h-3" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default EventCard;