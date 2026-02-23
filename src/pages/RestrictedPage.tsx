"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function RestrictedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-100">
            <ShieldAlert className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Acesso Restrito</h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            Você não tem permissão para acessar esta página. Seu perfil de usuário atual não permite a visualização deste conteúdo.
          </p>
          <p className="text-sm text-gray-400">
            Se você acredita que isso é um erro, entre em contato com o suporte.
          </p>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para a Página Inicial
        </Link>
      </motion.div>
    </div>
  );
}