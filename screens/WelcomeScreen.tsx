import React from 'react';
import Logo from '../components/Logo';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onRegister }) => {
  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col justify-between p-8 text-center animate-fade-in font-sans">
      <div />
      
      <div className="flex flex-col items-center">
        <Logo className="w-28 h-28 text-ifal-green mb-4" />
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">SIGEA</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">Portal de Eventos IFAL</p>
        <p className="mt-8 text-base text-gray-600 dark:text-gray-300 max-w-xs">
          Gerencie suas inscrições e certificados de forma simples e rápida.
        </p>
      </div>

      <div className="w-full max-w-sm mx-auto space-y-3">
        <button
          onClick={onLogin}
          className="w-full bg-ifal-green text-white font-bold py-4 rounded-[14px] text-[17px] shadow-lg shadow-ifal-green/20 active:scale-[0.98] transition-transform"
        >
          Entrar
        </button>
        <button
          onClick={onRegister}
          className="w-full bg-gray-200 dark:bg-[#1C1C1E] text-ifal-green font-bold py-4 rounded-[14px] text-[17px] active:scale-[0.98] transition-transform"
        >
          Criar Conta
        </button>
      </div>
      
       <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;
