
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/logo.png" alt="IFAL" className="h-full w-auto object-contain" />
      <span className="text-primary font-black text-xl tracking-tighter uppercase">Sigea</span>
    </div>
  );
};

export default Logo;
