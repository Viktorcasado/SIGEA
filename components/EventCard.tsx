
import React from 'react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onClick: () => void;
  horizontal?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, horizontal = false }) => {
  if (horizontal) {
    return (
      <div 
        onClick={onClick}
        className="snap-center shrink-0 w-[280px] h-[320px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-md transition-transform active:scale-95"
      >
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: `url(${event.imageUrl})`}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute top-3 left-3">
          <span className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${event.status === 'Inscrições Abertas' ? 'bg-green-500' : 'bg-blue-500'}`}>
            {event.status}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 p-4 w-full text-left">
          <p className="text-primary text-[10px] font-bold mb-1 uppercase tracking-wider">{event.campus}</p>
          <h3 className="text-white text-lg font-bold leading-tight mb-2 line-clamp-2">{event.title}</h3>
          <div className="flex items-center text-gray-300 text-[10px] gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
            <span>{event.date}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="group flex flex-col rounded-2xl bg-white dark:bg-surface-dark shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 dark:border-gray-800"
    >
      <div className="relative h-32 w-full bg-cover bg-center" style={{backgroundImage: `url(${event.imageUrl})`}}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <span className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${event.status === 'Inscrições Abertas' ? 'bg-green-500/90' : 'bg-blue-500/90'} backdrop-blur-sm`}>
          {event.status}
        </span>
        <button className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
          <span className="material-symbols-outlined text-lg">bookmark_border</span>
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-primary font-bold mb-1">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            {event.date}
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal">Presencial</span>
          </div>
          <h3 className="text-gray-900 dark:text-white text-base font-bold leading-tight line-clamp-2">{event.title}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-lg text-gray-400">location_on</span>
          <span className="truncate">{event.campus}</span>
        </div>
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex -space-x-2">
            {[1, 2].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-gray-200 bg-cover" style={{backgroundImage: `url(https://picsum.photos/seed/user${i}/50/50)`}}></div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">+120</div>
          </div>
          <button className="text-primary text-sm font-semibold hover:underline">Ver Detalhes</button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
