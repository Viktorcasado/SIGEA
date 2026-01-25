import React from 'react';
import Icon from './Icon';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-16 h-16 bg-ifal-green rounded-full flex items-center justify-center text-white shadow-lg z-20 transition-transform hover:scale-110 active:scale-95"
      aria-label="Abrir Assistente NAYARA"
    >
      <Icon name="sparkles" className="w-8 h-8" />
    </button>
  );
};

export default FloatingActionButton;