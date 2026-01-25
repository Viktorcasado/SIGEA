import React from 'react';
import Icon from './Icon';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
  actionButton?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack, actionButton }) => {
  return (
    <header className="p-4 flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-[#F2F2F7]/80 dark:bg-[#121212]/80 backdrop-blur-sm z-10">
      <button onClick={onBack} className="p-2 -ml-2 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-500/10 active:bg-gray-500/20">
        <Icon name="arrow-left" className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-semibold truncate flex-grow">{title}</h1>
      {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
    </header>
  );
};

export default PageHeader;