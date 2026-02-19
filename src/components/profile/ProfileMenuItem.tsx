"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface ProfileMenuItemProps {
  to?: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

const ProfileMenuItem = ({ to, icon: Icon, label, onClick, variant = 'default' }: ProfileMenuItemProps) => {
  const content = (
    <div className="flex items-center justify-between p-4 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`font-semibold ${variant === 'danger' ? 'text-red-600' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
      {to && <ChevronRight className="w-5 h-5 text-gray-300" />}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left hover:bg-gray-50 border-b last:border-b-0 border-gray-100">
        {content}
      </button>
    );
  }

  return (
    <Link to={to || '#'} className="block hover:bg-gray-50 border-b last:border-b-0 border-gray-100">
      {content}
    </Link>
  );
};

export default ProfileMenuItem;