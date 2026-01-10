
import React from 'react';
import { Event as SIGEAEvent } from '../types.ts';

interface EventCardProps {
  event: SIGEAEvent;
  onClick: () => void;
  horizontal?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, horizontal = false }) => {
  if (horizontal) {
    return (
      <div 
        onClick={onClick}
        className="w-[300px] shrink-0 group cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="relative h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          
          <div className="absolute top-6 left-6">
             <span className="bg-zinc-800/80 backdrop-blur-md text-white text-[9px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest border border-white/10">
              {event.type}
            </span>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-2 text-primary text-[11px] font-black uppercase tracking-widest mb-3">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {event.date}
            </div>
            <h3 className="text-white text-2xl font-black leading-none tracking-tighter uppercase line-clamp-2">
              {event.title}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="flex gap-4 p-5 bg-white dark:bg-[#18181b] rounded-3xl cursor-pointer active:scale-95 group transition-all border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md"
    >
      <div className="size-20 rounded-2xl overflow-hidden shrink-0">
        <img 
          src={event.imageUrl} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={event.title} 
        />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <h4 className="text-slate-900 dark:text-white font-black text-[13px] leading-tight uppercase tracking-tight line-clamp-2">
          {event.title}
        </h4>
        <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
          <span className="text-primary">{event.type}</span>
          <span>•</span>
          <span>{event.date}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
