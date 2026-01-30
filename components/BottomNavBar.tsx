import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const BottomNavBar: React.FC = () => {
  const items = [
    { to: '/', icon: 'home', icon_fill: 'home_fill', label: 'Início' },
    { to: '/eventos', icon: 'calendar', icon_fill: 'calendar_fill', label: 'Eventos' },
    { to: '/certificados', icon: 'star', icon_fill: 'star_fill', label: 'Diplomas' },
    { to: '/perfil', icon: 'person_circle', icon_fill: 'person_circle_fill', label: 'Conta' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-t border-black/5 dark:border-white/5 h-[84px] px-8 flex justify-between items-center z-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center justify-center transition-all duration-300 relative py-2
            ${isActive ? 'text-ifal-green' : 'text-gray-400'}
          `}
        >
          {({ isActive }) => (
            <>
              <Icon 
                name={(isActive ? item.icon_fill : item.icon) as any} 
                className={`w-7 h-7 transition-transform ${isActive ? 'scale-110' : ''}`} 
              />
              <span className={`text-[9px] font-black mt-1.5 uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-ifal-green rounded-full shadow-[0_0_10px_rgba(46,125,50,1)]"></div>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavBar;