import React from 'react';
import Icon from './Icon';

const SearchBar: React.FC = () => {
  return (
    <div className="px-6 pb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon name="search" className="w-5 h-5 text-ifal-green" />
        </div>
        <input
          type="text"
          placeholder="BUSCAR POR CONGRESSOS, WORKSHOPS..."
          className="w-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 rounded-full py-4 pl-12 pr-4 text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-ifal-green"
        />
      </div>
    </div>
  );
};

export default SearchBar;