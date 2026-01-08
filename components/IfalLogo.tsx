
import React from 'react';

interface IfalLogoProps {
  className?: string;
  showText?: boolean;
}

const IfalLogo: React.FC<IfalLogoProps> = ({ className = "h-10", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Símbolo Oficial IF - Geometria Corrigida e Proporcional */}
      <svg 
        viewBox="0 0 400 520" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-full w-auto drop-shadow-sm"
      >
        {/* Círculo Vermelho (i) */}
        <circle cx="60" cy="60" r="60" fill="#E30613" />
        
        {/* Grade de Quadrados Verdes (IF) */}
        <rect x="140" y="0" width="120" height="120" rx="12" fill="#32963B" />
        <rect x="280" y="0" width="120" height="120" rx="12" fill="#32963B" />
        
        <rect x="0" y="140" width="120" height="120" rx="12" fill="#32963B" />
        <rect x="140" y="140" width="120" height="120" rx="12" fill="#32963B" />
        
        <rect x="0" y="280" width="120" height="120" rx="12" fill="#32963B" />
        <rect x="140" y="280" width="120" height="120" rx="12" fill="#32963B" />
        <rect x="280" y="280" width="120" height="120" rx="12" fill="#32963B" />
        
        <rect x="0" y="420" width="120" height="120" rx="12" fill="#32963B" />
        <rect x="140" y="420" width="120" height="120" rx="12" fill="#32963B" />
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-[1.1] select-none">
          <span className="font-black text-[11px] uppercase tracking-tighter text-slate-900 dark:text-white transition-colors duration-300">
            Instituto Federal
          </span>
          <span className="font-medium text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] mt-0.5 transition-colors duration-300">
            Alagoas
          </span>
        </div>
      )}
    </div>
  );
};

export default IfalLogo;
