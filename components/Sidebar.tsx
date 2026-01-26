import React from 'react';
import Icon from './Icon';
import Logo from './Logo';
import { IconName } from '../types';

interface NavItemProps {
  icon: IconName;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  const activeClasses = 'bg-ifal-green/10 text-ifal-green';
  const inactiveClasses = 'text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 dark:hover:bg-gray-700/50';

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-xl transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon name={icon} className="w-6 h-6" />
      <span className="ml-4 font-semibold text-[15px]">{label}</span>
    </button>
  );
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'home' | 'events' | 'certificates' | 'profile') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-72 h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-black/5 dark:border-white/5 flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center px-2 pt-4 pb-6 mb-4">
        <Logo className="h-8 text-ifal-green" />
      </div>
      <nav className="flex flex-col space-y-2">
        <NavItem
          icon={activeTab === 'home' ? 'home_fill' : 'home'}
          label="Início"
          isActive={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
        />
        <NavItem
          icon={activeTab === 'events' ? 'calendar_fill' : 'calendar'}
          label="Eventos"
          isActive={activeTab === 'events'}
          onClick={() => setActiveTab('events')}
        />
        <NavItem
          icon={activeTab === 'certificates' ? 'star_fill' : 'star'}
          label="Certificados"
          isActive={activeTab === 'certificates'}
          onClick={() => setActiveTab('certificates')}
        />
        <NavItem
          icon={activeTab === 'profile' ? 'person_circle_fill' : 'person_circle'}
          label="Perfil & Configurações"
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
      </nav>
      <div className="flex-grow" />
      {/* Footer can be added here */}
    </aside>
  );
};

export default Sidebar;
