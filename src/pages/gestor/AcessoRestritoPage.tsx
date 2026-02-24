"use client";

import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

export default function AcessoRestritoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 text-center border border-gray-100"
      >
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-3">Área de Gestão</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Esta seção é exclusiva para usuários com perfil de <strong>Gestor</strong> ou <strong>Administrador</strong>.
        </p>

        <div className="space-y-3">
          <Link 
            to="/"
            className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Ir para Área Pública
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-2 text-gray-400">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Acesso Protegido</span>
        </div>
      </motion.div>
    </div>
  );
}