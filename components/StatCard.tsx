import React from 'react';
import Icon from './Icon';
import { IconName } from '../types';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  color?: string; // Tailwind color class like 'text-ifal-green'
  bgColor?: string; // Tailwind bg color class like 'bg-ifal-green/10'
  trend?: string; // Example: '+12%'
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'text-ifal-green', bgColor = 'bg-ifal-green/10', trend }) => {
  return (
    <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[28px] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 ${bgColor} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon name={icon} className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase">
            {trend}
          </span>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-1">
          {label}
        </span>
        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
          {value}
        </span>
      </div>
    </div>
  );
};

export default StatCard;