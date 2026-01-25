import React from 'react';
import Icon from './Icon';
import { IconName } from '../types';

interface ProfileMenuItemProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 active:bg-ifal-green/10"
    >
      <div className="flex items-center space-x-4">
        <Icon name={icon} className="w-6 h-6 text-gray-400 dark:text-gray-400" />
        <span className="text-gray-900 dark:text-gray-100">{label}</span>
      </div>
      <Icon name="chevron-right" className="w-5 h-5 text-gray-400 dark:text-gray-500" />
    </button>
  );
};

export default ProfileMenuItem;