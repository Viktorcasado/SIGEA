import React, { useState, useEffect, useRef } from 'react';

interface ContextAction {
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
}

interface ContextMenuProps {
  trigger: React.ReactElement;
  actions: ContextAction[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({ trigger, actions }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setVisible(true);
    
    // Adjust position to prevent menu from going off-screen
    const menuWidth = 224; // Corresponds to w-56
    const menuHeight = actions.length * 40 + 16; // Approximate height
    
    const x = event.clientX + menuWidth > window.innerWidth
      ? window.innerWidth - menuWidth - 10
      : event.clientX;
      
    const y = event.clientY + menuHeight > window.innerHeight
      ? window.innerHeight - menuHeight - 10
      : event.clientY;

    setPosition({ x, y });
  };
  
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setVisible(false);
    }
  };

  useEffect(() => {
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);

  const handleActionClick = (action: ContextAction) => {
    action.onClick();
    setVisible(false);
  };

  return (
    <>
      {React.cloneElement(trigger, { onContextMenu: handleContextMenu })}
      {visible && (
        <div
          ref={menuRef}
          className="fixed z-50 w-56 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-black/5 dark:border-white/5 p-2 animate-fade-in-fast"
          style={{ top: position.y, left: position.x }}
        >
          <ul className="flex flex-col">
            {actions.map((action, index) => (
              <li key={index}>
                <button
                  onClick={() => handleActionClick(action)}
                  className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    action.isDestructive
                      ? 'text-red-500 hover:bg-red-500/10'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-500/10 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {action.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
       <style>{`
        .animate-fade-in-fast { animation: fadeInFast 0.1s ease-out forwards; }
        @keyframes fadeInFast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
};

export default ContextMenu;
