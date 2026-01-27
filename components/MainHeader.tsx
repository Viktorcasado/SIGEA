import React from 'react';
import { useUser } from '../contexts/UserContext';
import Icon from './Icon';

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
        <div className="flex items-center space-x-4">
            <button 
                onClick={() => onNavigate('Notificações')} 
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-ifal-green rounded-full transition-colors"
                aria-label="Notificações"
            >
                <Icon name="bell" className="w-6 h-6" />
            </button>
            
            <button
                onClick={() => onNavigate('Editar Perfil')}
                className="flex items-center space-x-3 group"
                aria-label="Editar perfil"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-ifal-green transition-colors">{user?.full_name.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user?.user_type}</p>
                </div>
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center font-semibold overflow-hidden transition-all group-hover:ring-2 ring-ifal-green ring-offset-2 dark:ring-offset-black">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-800 dark:text-gray-100 text-sm font-bold">{getInitials(user?.full_name)}</span>
                    )}
                </div>
            </button>
        </div>
    );
};

export default MainHeader;