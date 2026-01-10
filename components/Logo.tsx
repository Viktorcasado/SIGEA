
import React from 'react';

interface LogoProps {
  className?: string;
  dark?: boolean; // Força tema escuro se verdadeiro
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
      <span className={`
        font-[900] 
        tracking-[-0.06em] 
        ${sizeClasses[size]}
        leading-none
        transition-colors duration-300
        ${dark ? 'text-white' : 'text-slate-900 dark:text-white'}
      `}>
        SI<span className="text-primary">GEA</span>
      </span>
    </div>
  );
};

export default Logo;
