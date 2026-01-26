import React from 'react';

interface Action {
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Action[];
}

const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose, title, actions }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm p-3 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/90 dark:bg-[#2C2C2E]/90 backdrop-blur-xl rounded-[14px] overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 border-b border-black/10 dark:border-white/10">
            {title}
          </div>
        )}
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full py-4 text-[17px] font-medium border-b border-black/5 dark:border-white/5 last:border-b-0 active:bg-black/5 dark:active:bg-white/5 transition-colors ${
              action.isDestructive ? 'text-[#FF3B30]' : 'text-[#007AFF]'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-2 bg-white dark:bg-[#2C2C2E] w-full py-4 rounded-[14px] text-[17px] text-[#007AFF] font-bold animate-slide-up active:bg-black/5 dark:active:bg-white/5"
      >
        Cancelar
      </button>
       <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ActionSheet;
