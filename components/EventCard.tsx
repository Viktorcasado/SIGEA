
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
        className="w-[280px] shrink-0 group cursor-pointer active:scale-95 transition-transform"
      >
        <div className="relative h-[360px] rounded-4xl overflow-hidden mb-3 premium-card">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
          
          <div className="absolute top-5 left-5">
             <span className="bg-white/20 backdrop-blur-xl text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-white/30">
              {event.type}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {event.date}
            </div>
            <h3 className="text-white text-xl font-black leading-tight line-clamp-2 tracking-tighter uppercase">
              {event.title}
            </h3>
            <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span>
              {event.campus}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-3xl cursor-pointer premium-card active:scale-95 group transition-all"
    >
      <div className="size-20 rounded-2xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
        <img 
          src={event.imageUrl} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={event.title} 
        />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-primary text-[8px] font-black uppercase tracking-widest">{event.type}</span>
          <span className="size-1 bg-zinc-300 rounded-full"></span>
          <span className="text-zinc-400 text-[8px] font-black uppercase tracking-widest">{event.date}</span>
        </div>
        <h4 className="text-zinc-900 dark:text-zinc-100 font-black text-xs leading-tight line-clamp-2 uppercase tracking-tight">
          {event.title}
        </h4>
        <div className="flex items-center gap-1 text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
          <span className="material-symbols-outlined text-[14px]">room</span>
          {event.campus}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
