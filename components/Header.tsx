import React from 'react';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
    onNavigate: (screen: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user } = useUser();

  const handleProfileClick = () => {
    onNavigate('Editar Perfil');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="p-6 flex justify-between items-center">
      <div>
           {user && (
              <h2 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-white">
                  Olá, <span className="text-ifal-green">{user.full_name.split(' ')[0]}</span>
              </h2>
           )}
      </div>
      
      <button
        onClick={handleProfileClick}
        className="w-11 h-11 bg-ifal-green rounded-full flex items-center justify-center text-white font-semibold text-xl overflow-hidden transition-transform active:scale-90"
        aria-label="Editar perfil"
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white">{getInitials(user?.full_name)}</span>
        )}
      </button>
    </header>
  );
};

export default Header;