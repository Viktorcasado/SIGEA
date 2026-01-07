
import React from 'react';

interface IfalLogoProps {
  className?: string;
  showText?: boolean;
}

const IfalLogo: React.FC<IfalLogoProps> = ({ className = "h-8", showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 100 125" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
        <circle cx="20" cy="20" r="18" fill="#E30613" />
        <rect x="42" y="2" width="24" height="24" rx="4" fill="#32963B" />
        <rect x="70" y="2" width="24" height="24" rx="4" fill="#32963B" />
        <rect x="14" y="42" width="24" height="24" rx="4" fill="#32963B" />
        <rect x="42" y="42" width="24" height="24" rx="4" fill="#32963B" />
        <rect x="14" y="70" width="24" height="24" rx="4" fill="#32963B" />
        <rect x="42" y="70" width="24" height="24" rx="4" fill="#32963B" />
        <rect x="70" y="70" width="24" height="24" rx="4" fill="#32963B" />
        <rect x="14" y="98" width="24" height="24" rx="4" fill="#32963B" />
        <rect x="42" y="98" width="24" height="24" rx="4" fill="#32963B" />
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-[0.85] select-none">
          <span className="font-black text-[10px] uppercase tracking-tighter text-slate-900 dark:text-white">Instituto</span>
          <span className="font-black text-[10px] uppercase tracking-tighter text-slate-900 dark:text-white">Federal</span>
          <span className="font-medium text-[9px] text-slate-500 dark:text-slate-400">Alagoas</span>
        </div>
      )}
    </div>
  );
};

export default IfalLogo;
