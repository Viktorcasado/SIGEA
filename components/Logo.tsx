
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8" }) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span className="text-primary font-black text-3xl tracking-tighter uppercase">Sigea</span>
    </div>
  );
};

export default Logo;
