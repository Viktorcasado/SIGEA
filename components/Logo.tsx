
import React from 'react';

interface LogoProps {
  className?: string;
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge';
}

const Logo: React.FC<LogoProps> = ({ className = "", dark = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[18px]',
    md: 'text-[28px]',
    lg: 'text-[44px]',
    xl: 'text-[64px]',
    huge: 'text-[100px]'
  };

  return (
    <div className={`flex items-center select-none ${className}`}>
      <div className="flex flex-col items-start">
        <span className={`
          ${dark ? 'text-white' : 'text-primary'} 
          font-[900] 
          tracking-[-0.06em] 
          ${sizeClasses[size]}
          leading-none
        `}>
          Sigea
        </span>
      </div>
    </div>
  );
};

export default Logo;
