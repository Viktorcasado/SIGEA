import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Esconde o elemento <img> se a imagem não puder ser carregada
    (e.currentTarget as HTMLImageElement).style.display = 'none';
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/assets/logo-dark.png"
        alt="Logo SIGEA"
        className="h-full w-auto object-contain block dark:hidden"
        onError={handleError}
      />
      <img
        src="/assets/logo-light.png"
        alt="Logo SIGEA"
        className="h-full w-auto object-contain hidden dark:block"
        onError={handleError}
      />
    </div>
  );
};

export default Logo;