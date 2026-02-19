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
      ativo_comunidade: { text: 'Comunidade', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      ativo_vinculado: { text: 'Vinculado', color: 'bg-green-100 text-green-700 border-green-200' },
      gestor: { text: 'Gestor', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      admin: { text: 'Admin', color: 'bg-red-100 text-red-700 border-red-200' },
    };
    const current = statuses[user.status] || { text: 'Visitante', color: 'bg-gray-100 text-gray-700 border-gray-200' };
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
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-6"
    >
      <div className="relative">
        <div className="w-24 h-24 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
          {getInitials(user.nome)}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.nome}</h1>
          <div className="flex justify-center sm:justify-start">
            {statusBadge()}
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-3">{user.email}</p>
        
        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
          <Link 
            to="/perfil/editar" 
            className="text-xs font-bold py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Editar Perfil
          </Link>
          {user.status === 'ativo_comunidade' && (
            <Link 
              to="/perfil/instituicao-campus" 
              className="text-xs font-bold py-2 px-4 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
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