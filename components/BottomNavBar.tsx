import React from 'react';
import Icon from './Icon';
import { IconName } from '../types';

interface NavItemProps {
  icon: IconName;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, isActive, onClick }) => {
  const color = isActive ? 'text-ifal-green' : 'text-gray-400 dark:text-gray-500';
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center transition-colors duration-200">
      <Icon name={icon} className={`w-7 h-7 ${color}`} />
    </button>
  );
};

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: 'home' | 'events' | 'certificates' | 'profile') => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-black/5 dark:border-white/5">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-4">
        <NavItem 
            icon={activeTab === 'home' ? 'home_fill' : 'home'} 
            isActive={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
        />
        <NavItem 
            icon={activeTab === 'events' ? 'calendar_fill' : 'calendar'}
            isActive={activeTab === 'events'} 
            onClick={() => setActiveTab('events')} 
        />
        <NavItem 
            icon={activeTab === 'certificates' ? 'star_fill' : 'star'} 
            isActive={activeTab === 'certificates'} 
            onClick={() => setActiveTab('certificates')} 
        />
        <NavItem 
            icon={activeTab === 'profile' ? 'person_circle_fill' : 'person_circle'} 
            isActive={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
        />
      </div>
    </div>
  );
};

export default BottomNavBar;