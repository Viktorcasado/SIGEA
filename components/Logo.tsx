import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12" }) => {
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      <img
        src="/assets/logo-source.jpg"
        alt="Logo SIGEA IFAL"
        className="h-full w-auto object-contain"
        onError={(e) => {
          console.error("Falha ao carregar logo institucional.");
          // Fallback silencioso para placeholder verde se a imagem sumir do servidor
          (e.currentTarget as HTMLImageElement).style.backgroundColor = '#2e7d32';
        }}
      />
    </div>
  );
};

export default Logo;