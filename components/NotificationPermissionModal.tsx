import React from 'react';
import Icon from './Icon';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  isBlocked: boolean;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ isOpen, onAllow, onDeny, isBlocked }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg w-full max-w-sm rounded-2xl shadow-xl p-6 text-center animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-ifal-green/10 rounded-full mx-auto flex items-center justify-center mb-4">
          <Icon name="bell" className="w-8 h-8 text-ifal-green" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
          {isBlocked ? 'Notificações Bloqueadas' : 'Ativar Notificações?'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isBlocked 
            ? 'Para receber lembretes, você precisa permitir as notificações nas configurações do seu navegador.'
            : 'Permita o envio de notificações para receber lembretes importantes sobre os eventos nos quais você se inscreveu.'
          }
        </p>
        <div className="flex flex-col space-y-2 mt-6">
          {!isBlocked && (
            <button onClick={onAllow} className="w-full bg-ifal-green text-white font-semibold py-2.5 rounded-lg">
              Ativar Notificações
            </button>
          )}
          <button onClick={onDeny} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2.5 rounded-lg">
            {isBlocked ? 'Entendi' : 'Agora não'}
          </button>
        </div>
      </div>
       <style>{`
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
    </div>
  );
};

export default NotificationPermissionModal;