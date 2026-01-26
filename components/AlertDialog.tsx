import React from 'react';

interface AlertAction {
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
}

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  content: string;
  actions: AlertAction[];
}

const AlertDialog: React.FC<AlertDialogProps> = ({ isOpen, title, content, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xl w-full max-w-sm rounded-2xl shadow-xl p-0 text-center animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-[15px] text-gray-800 dark:text-gray-300 mt-2">{content}</p>
        </div>
        <div className="flex border-t border-black/10 dark:border-white/10">
            {actions.map((action, index) => (
                <button 
                    key={index}
                    onClick={action.onClick}
                    className={`flex-1 py-3 text-[17px] font-medium transition-colors active:bg-black/5 dark:active:bg-white/5 ${
                        action.isDestructive ? 'text-[#FF3B30]' : 'text-[#007AFF]'
                    } ${index > 0 ? 'border-l border-black/10 dark:border-white/10' : ''}`}
                >
                    {action.label}
                </button>
            ))}
        </div>
      </div>
       <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AlertDialog;
