import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ThemeOption = {
    value: 'light' | 'dark' | 'system';
    label: string;
    icon: React.ReactNode;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleSelectTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    onClose();
  };

  const options: ThemeOption[] = [
      { value: 'light', label: 'Claro', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
      { value: 'dark', label: 'Escuro', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> },
      { value: 'system', label: 'Padrão do Sistema', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  ]

  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-xl p-6"
        onClick={(e) => e.stopPropagation()}
    >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Escolha um tema</h2>
        <div className="space-y-2">
            {options.map(opt => (
                <button 
                    key={opt.value} 
                    onClick={() => handleSelectTheme(opt.value)}
                    className={`w-full flex items-center p-3 rounded-xl transition-colors ${theme === opt.value ? 'bg-ifal-green/10 text-ifal-green' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    {opt.icon}
                    <span className="ml-3 font-semibold">{opt.label}</span>
                    {theme === opt.value && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;