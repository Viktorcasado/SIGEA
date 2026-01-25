import React from 'react';
import { Notification, IconName } from '../types';
import Icon from './Icon';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const getIconDetails = (): { name: IconName; color: string } => {
    switch (notification.type) {
      case 'event':
        return { name: 'calendar', color: 'bg-blue-500' };
      case 'update':
        return { name: 'arrow-path', color: 'bg-orange-500' };
      case 'announcement':
        return { name: 'bell', color: 'bg-ifal-green' };
      default:
        return { name: 'bell', color: 'bg-gray-500' };
    }
  };

  const { name, color } = getIconDetails();

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-3 text-left transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 active:bg-ifal-green/10"
    >
      <div className="w-16 flex items-center justify-center flex-shrink-0">
          {!notification.is_read && (
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full absolute -translate-x-6"></div>
          )}
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <Icon name={name} className="w-6 h-6 text-white" />
          </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{notification.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{notification.subtitle}</p>
      </div>
      <Icon name="chevron-right" className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0" />
    </button>
  );
};

export default NotificationItem;
