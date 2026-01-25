import React, { useState } from 'react';
import { User } from '../types';
import { UserRole } from '../App';
import ProfileGroup from '../components/ProfileGroup';
import ProfileMenuItem from '../components/ProfileMenuItem';
import ToggleSwitch from '../components/ToggleSwitch';
import Icon from '../components/Icon';
import ThemeModal from '../components/ThemeModal';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';

interface ProfileScreenProps {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    onNavigate: (title: string) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userRole, setUserRole, onNavigate }) => {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const { user, loading } = useUser();

    const handleRoleChange = (isOrganizer: boolean) => {
        setUserRole(isOrganizer ? 'organizer' : 'participant');
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
    };
    
    const renderProfileIdentifier = () => {
        if (!user) return null;
        const registrationValue = user.registration_number || 'Não informado';

        switch (user.user_type) {
            case 'aluno':
                return <p className="text-gray-500 dark:text-gray-400">Matrícula: {registrationValue}</p>;
            case 'servidor':
                return <p className="text-gray-500 dark:text-gray-400">SIAPE: {registrationValue}</p>;
            case 'externo':
                 return <p className="text-gray-500 dark:text-gray-400">Comunidade Externa</p>;
            default:
                 return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ifal-green"></div>
            </div>
        );
    }

  return (
    <>
        <div className="text-gray-900 dark:text-gray-100 pb-8">
            <header className="relative flex flex-col items-center p-8 space-y-2">
                <div className="absolute top-6 right-6">
                    <button 
                        onClick={() => onNavigate('Notificações')} 
                        className="text-gray-500 dark:text-gray-400 hover:text-ifal-green dark:hover:text-emerald-400 transition-colors p-2"
                        aria-label="Notificações"
                    >
                        <Icon name="bell" className="w-7 h-7" />
                    </button>
                </div>

                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 object-cover bg-gray-300"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon name="user" className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <h1 className="text-2xl font-semibold">{user?.full_name || 'Usuário sem nome'}</h1>
                {renderProfileIdentifier()}
            </header>

            <main className="px-4 space-y-6">
                <ProfileGroup title="Conta">
                  <ProfileMenuItem icon="pencil" label="Editar Perfil" onClick={() => onNavigate('Editar Perfil')} />
                  <ProfileMenuItem icon="shield" label="Segurança" onClick={() => onNavigate('Segurança')} />
                </ProfileGroup>

                <ProfileGroup title="Acadêmico">
                  <ProfileMenuItem icon="ticket" label="Minhas Inscrições" onClick={() => onNavigate('Minhas Inscrições')} />
                  <ProfileMenuItem icon="bar-chart" label="Histórico de Horas" onClick={() => onNavigate('Histórico de Horas')} />
                </ProfileGroup>
                
                <ProfileGroup title="Configurações">
                    <ProfileMenuItem icon="bell" label="Notificações" onClick={() => onNavigate('Notificações')} />
                    <ProfileMenuItem icon="swatch" label="Tema do App" onClick={() => setIsThemeModalOpen(true)} />
                </ProfileGroup>
                
                <ProfileGroup title="Modo de Acesso">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center space-x-4">
                            <Icon name="users-group" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            <div>
                                <span className="text-gray-900 dark:text-gray-100">Modo Organizador</span>
                                <p className="text-xs text-gray-500">Acesse o painel para gerenciar seus eventos.</p>
                            </div>
                        </div>
                        <ToggleSwitch enabled={userRole === 'organizer'} setEnabled={handleRoleChange} />
                    </div>
                </ProfileGroup>

                <ProfileGroup title="Ajuda">
                    <ProfileMenuItem icon="life-buoy" label="Central de Suporte" onClick={() => onNavigate('Central de Suporte')} />
                    <ProfileMenuItem icon="qrcode" label="Validar Certificado" onClick={() => onNavigate('Validar Certificado')} />
                </ProfileGroup>

                 <div className="px-4 pt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500/10 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-500/20 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </main>
        </div>
        <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </>
  );
};

export default ProfileScreen;