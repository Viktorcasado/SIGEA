"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileMenuItemProps {
  to?: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'success';
}

const ProfileMenuItem = ({ to, icon: Icon, label, description, onClick, variant = 'default' }: ProfileMenuItemProps) => {
  const variants = {
    default: "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400",
    success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400"
  };

  const labelColors = {
    default: "text-gray-700 dark:text-gray-200",
    danger: "text-red-600 dark:text-red-400",
    success: "text-emerald-600 dark:text-emerald-400"
  };

  const content = (
    <div className="flex items-center justify-between p-4 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${variants[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className={`font-bold text-sm ${labelColors[variant]}`}>
            {label}
          </span>
          {description && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {description}
            </span>
          )}
        </div>
      </div>
      {to && <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-700" />}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-b last:border-b-0 border-gray-100 dark:border-gray-800 transition-colors">
        {content}
      </button>
    );
  }

  return (
    <Link to={to || '#'} className="block hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-b last:border-b-0 border-gray-100 dark:border-gray-800 transition-colors">
      {content}
    </Link>
  );
};

export default ProfileMenuItem;