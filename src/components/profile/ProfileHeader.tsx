"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/src/types';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface ProfileHeaderProps {
  user: User | null;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  if (!user) return null;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
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
      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${current.color}`}>
        {current.text}
      </span>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-8"
    >
      <div className="relative">
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.nome} 
            className="w-28 h-28 rounded-[2rem] object-cover shadow-xl border-4 border-white"
          />
        ) : (
          <div className="w-28 h-28 bg-linear-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl">
            {getInitials(user.nome)}
          </div>
        )}
        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md">
          <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </div>
      
      <div className="flex-1 space-y-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.nome}</h1>
            <div className="flex justify-center sm:justify-start">
              {statusBadge()}
            </div>
          </div>
          <p className="text-gray-400 font-bold text-sm">{user.email}</p>
        </div>
        
        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
          <Link 
            to="/perfil/editar" 
            className="text-xs font-black py-3 px-6 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
          >
            Editar Perfil
          </Link>
          <Link 
            to="/perfil/vinculo" 
            className="text-xs font-black py-3 px-6 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Validar Vínculo
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;