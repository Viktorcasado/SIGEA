import React from 'react';
import { useUser } from '../contexts/UserContext';
import Icon from './Icon';

interface MainHeaderProps {
    title: string;
    onNavigate: (screen: string) => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ title, onNavigate }) => {
    const { user } = useUser();
    
    const getInitials = (name: string | undefined) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    return (
        <header className="p-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
            </h1>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => onNavigate('Notificações')} 
                    className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 rounded-full transition-colors"
                    aria-label="Notificações"
                >
                    <Icon name="bell" className="w-7 h-7" />
                </button>
                <button
                    onClick={() => onNavigate('Editar Perfil')}
                    className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden transition-transform active:scale-90"
                    aria-label="Editar perfil"
                >
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-800 dark:text-gray-100">{getInitials(user?.full_name)}</span>
                    )}
                </button>
            </div>
        </header>
    );
};

export default MainHeader;