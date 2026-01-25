import React from 'react';
import Icon from '../components/Icon';

interface PlaceholderScreenProps {
  title: string;
  onBack: () => void;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, onBack }) => {
  return (
    <div>
        <header className="p-4 flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700">
             <button onClick={onBack} className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Icon name="arrow-left" className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">{title}</h1>
        </header>
        <div className="p-6 h-[70vh] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-ifal-green/10 rounded-full flex items-center justify-center mb-4">
                <Icon name="layout" className="w-8 h-8 text-ifal-green" />
            </div>
            <h2 className="text-2xl font-bold">Em Desenvolvimento</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
                Esta tela estará disponível em breve.
            </p>
        </div>
    </div>
  );
};

export default PlaceholderScreen;
