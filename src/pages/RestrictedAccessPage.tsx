"use client";

import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Lock, Home } from 'lucide-react';
import { motion } from 'motion/react';

export default function RestrictedAccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto rotate-3">
            <ShieldAlert className="w-12 h-12 text-orange-600 -rotate-3" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">
          Acesso Restrito
        </h1>
        
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Ops! Parece que você tentou acessar uma área que exige permissões especiais ou um perfil diferente do seu.
        </p>

        <div className="space-y-3">
          <Link 
            to="/"
            className="flex items-center justify-center gap-3 w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Home className="w-5 h-5" />
            Voltar para o Início
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 w-full bg-white text-gray-600 font-bold py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Página Anterior
          </button>
        </div>

        <p className="mt-10 text-sm text-gray-400 font-medium">
          Se você acredita que isso é um erro, entre em contato com a coordenação do seu campus.
        </p>
      </motion.div>
    </div>
  );
}