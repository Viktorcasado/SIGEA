"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/src/types';
import { motion } from 'motion/react';

interface ProfileHeaderProps {
  user: User | null;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  if (!user) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const statusBadge = () => {
    const statuses = {
      ativo_comunidade: { text: 'Comunidade', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
      ativo_vinculado: { text: 'Vinculado', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
      gestor: { text: 'Gestor', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
      admin: { text: 'Admin', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
    };
    const current = statuses[user.status] || { text: 'Visitante', color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${current.color}`}>
        {current.text}
      </span>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-6"
    >
      <div className="relative">
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.nome} 
            className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-800"
          />
        ) : (
          <div className="w-24 h-24 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            {getInitials(user.nome)}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.nome}</h1>
          <div className="flex justify-center sm:justify-start">
            {statusBadge()}
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{user.email}</p>
        
        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
          <Link 
            to="/perfil/editar" 
            className="text-xs font-bold py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Editar Perfil
          </Link>
          {user.status === 'ativo_comunidade' && (
            <Link 
              to="/perfil/instituicao-campus" 
              className="text-xs font-bold py-2 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              Validar Vínculo
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;