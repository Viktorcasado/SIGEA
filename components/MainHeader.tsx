import React from 'react';
import { useUser } from '../contexts/UserContext';
import Icon from './Icon';
import Logo from './Logo';

interface MainHeaderProps {
    onNavigate: (screen: string) => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ onNavigate }) => {
    const { user } = useUser();
    
    const getInitials = (name: string | undefined) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="flex items-center justify-between px-4 h-16">
            {/* Left placeholder to balance the flexbox and allow for future icons like a menu drawer */}
            <div className="w-24 flex justify-start"></div> 
            
            <div className="flex justify-center">
                <Logo className="h-7 text-ifal-green dark:text-gray-100" />
            </div>

            <div className="w-24 flex justify-end items-center space-x-2">
                <button 
                    onClick={() => { /* Placeholder for future search functionality */ }} 
                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-500/10 rounded-full transition-colors"
                    aria-label="Buscar"
                >
                    <Icon name="search" className="w-6 h-6" />
                </button>
                 <button
                    onClick={() => onNavigate('Editar Perfil')}
                    className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-semibold overflow-hidden transition-transform active:scale-90"
                    aria-label="Editar perfil"
                >
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-800 dark:text-gray-100 text-sm font-bold">{getInitials(user?.full_name)}</span>
                    )}
                </button>
            </div>
        </header>
    );
};

export default MainHeader;
