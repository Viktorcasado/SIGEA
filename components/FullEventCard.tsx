import React, { useState } from 'react';
import { Event } from '../types';
import Icon from './Icon';
import Logo from './Logo';

interface FullEventCardProps {
  event: Event;
  onClick: () => void;
}

const FullEventCard: React.FC<FullEventCardProps> = ({ event, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const formatEventDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
    } catch { return dateStr; }
  };

  return (
    <button 
        onClick={onClick} 
        className="w-full bg-white dark:bg-gray-800 rounded-[22px] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden text-left border border-gray-100 dark:border-gray-700 active:scale-[0.98]"
    >
      <div className="relative h-48 bg-white dark:bg-gray-900 flex items-center justify-center">
        {(!event.imageUrl || imageError) ? (
          <Logo 
            className="w-28" 
          />
        ) : (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover" 
            onError={() => setImageError(true)} 
          />
        )}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl">
             <span className="text-ifal-green font-black text-[10px] uppercase tracking-tighter">
                {formatEventDate(event.date)}
             </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight line-clamp-2 pr-4">{event.title}</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex-shrink-0 mt-1">{event.category}</span>
        </div>
        
        <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400 mt-4">
            <div className="flex items-center space-x-2">
                <Icon name="clock" className="w-4 h-4 text-ifal-green" />
                <span className="text-xs font-bold">{event.hours || 0}H Certificadas</span>
            </div>
            <div className="flex items-center space-x-2">
                <Icon name="location" className="w-4 h-4 text-ifal-green" />
                <span className="text-xs font-bold truncate max-w-[120px]">
                    {event.location}
                </span>
            </div>
        </div>
      </div>
    </button>
  );
};

export default FullEventCard;