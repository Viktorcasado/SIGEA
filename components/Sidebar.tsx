import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, ClipboardList, User, LogOut, Award } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../services/supabaseClient';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Início' },
    { to: '/eventos', icon: <Calendar size={20} />, label: 'Eventos' },
    { to: '/inscricoes', icon: <ClipboardList size={20} />, label: 'Inscrições' },
    { to: '/certificados', icon: <Award size={20} />, label: 'Certificados' },
    { to: '/perfil', icon: <User size={20} />, label: 'Meu Perfil' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col z-50">
      <div className="p-6 border-b border-gray-50">
        <Logo className="h-10 mx-auto" />
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-[#2e7d32] text-white shadow-md shadow-green-900/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2e7d32]'}
            `}
          >
            {item.icon}
            <span className="font-semibold text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={() => supabase.auth.signOut()}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold text-sm"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;