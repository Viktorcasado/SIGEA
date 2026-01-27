
import React, { useState } from 'react';
import Icon from './Icon';
import Logo from './Logo';
import { IconName } from '../types';

// Defining MainTab type locally as it is used for deep navigation to ManageAttendeesScreen tabs
type MainTab = 'dashboard' | 'attendees' | 'programacao' | 'certificates' | 'settings';

interface NavItemProps {
  icon: IconName;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasSubmenu?: boolean;
  isExpanded?: boolean;
  isSubItem?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, hasSubmenu, isExpanded, isSubItem }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-5 py-3.5 rounded-xl transition-all duration-200 group relative ${
        isSubItem ? 'pl-10' : ''
      } ${
        isActive 
          ? 'bg-ifal-green text-white shadow-lg shadow-ifal-green/20' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon name={icon} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
      <span className={`ml-4 text-left flex-1 ${isSubItem ? 'text-[13px] font-medium' : 'text-[14px] font-semibold'}`}>
        {label}
      </span>
      {hasSubmenu && (
        <Icon 
          name="chevron-right" 
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-white' : 'text-gray-600'}`} 
        />
      )}
      {isActive && !isSubItem && (
        <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
      )}
    </button>
  );
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'home' | 'events' | 'certificates' | 'profile') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isProgramacaoExpanded, setIsProgramacaoExpanded] = useState(false);

  // Função para navegar injetando parâmetros de aba na URL
  const navigateDeep = (tab: MainTab, sub?: string) => {
      setActiveTab('home'); // Assume que a gestão está no Dashboard (Home) para o organizador
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      if (sub) url.searchParams.set('sub', sub);
      window.history.pushState({}, '', url.toString());
      // Dispara evento manual para o ManageAttendeesScreen reagir se já estiver montado
      window.dispatchEvent(new Event('popstate'));
  };

  return (
    <aside className="w-[250px] h-full bg-[#1A1A1A] flex flex-col flex-shrink-0 z-30 shadow-2xl overflow-y-auto">
      <div className="p-8 mb-4">
        <Logo className="h-8 text-white" />
        <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-3 ml-1">Sistema Integrado</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavItem
          icon={activeTab === 'home' ? 'home_fill' : 'home'}
          label="Painel"
          isActive={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
        />
        
        <NavItem
          icon={activeTab === 'events' ? 'calendar_fill' : 'calendar'}
          label="Inscrições"
          isActive={activeTab === 'events'}
          onClick={() => setActiveTab('events')}
        />

        {/* Menu Expansível Estilo Even3 */}
        <div className="space-y-1">
          <NavItem
            icon="layout"
            label="Programação"
            isActive={false}
            hasSubmenu
            isExpanded={isProgramacaoExpanded}
            onClick={() => setIsProgramacaoExpanded(!isProgramacaoExpanded)}
          />
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isProgramacaoExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="py-1 space-y-1">
              <NavItem
                icon="list"
                label="Atividades"
                isActive={false}
                isSubItem
                onClick={() => navigateDeep('programacao', 'lista')}
              />
              <NavItem
                icon="users"
                label="Palestrantes"
                isActive={false}
                isSubItem
                onClick={() => navigateDeep('programacao', 'palestrantes')}
              />
              <NavItem
                icon="location"
                label="Locais/Salas"
                isActive={false}
                isSubItem
                onClick={() => navigateDeep('programacao', 'locais')}
              />
            </div>
          </div>
        </div>

        <NavItem
          icon={activeTab === 'certificates' ? 'star_fill' : 'star'}
          label="Certificados"
          isActive={activeTab === 'certificates'}
          onClick={() => setActiveTab('certificates')}
        />
      </nav>

      <div className="p-6 border-t border-white/5">
        <NavItem
          icon={activeTab === 'profile' ? 'person_circle_fill' : 'person_circle'}
          label="Meu Perfil"
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
