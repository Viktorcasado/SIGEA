"use client";

import { Link } from 'react-router-dom';
import { ArrowLeft, Info, ShieldCheck, Code2, Heart, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <img src="/public/assets/logo-light.jpg" alt="Sigea Watermark" className="w-32 h-32 object-contain" />
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img src="/public/assets/logo-light.jpg" alt="SIGEA Logo" className="w-16 h-16 rounded-2xl shadow-sm object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter">SIGEA</h1>
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-md uppercase">v1.0.0</span>
              </div>
              <p className="text-gray-500 font-medium">Sistema Integrado de Gestão de Eventos Acadêmicos</p>
            </div>
          </div>
        </header>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">O Projeto</h3>
            <p>
              O SIGEA foi concebido como uma solução unificada para centralizar a gestão de eventos, 
              inscrições e certificações nas instituições de ensino superior de Alagoas. Nossa missão é 
              eliminar a burocracia e garantir a integridade dos documentos acadêmicos.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Licença
              </div>
              <p className="text-xs">MIT License - Open Source</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold mb-1">
                <Mail className="w-4 h-4 text-indigo-600" />
                Suporte
              </div>
              <a href="mailto:sigea@eventosmd.tech" className="text-xs text-indigo-600 hover:underline font-medium">
                sigea@eventosmd.tech
              </a>
            </div>
          </div>

          <section className="pt-6 border-t border-gray-100">
            <p className="text-xs text-center flex items-center justify-center gap-1.5 font-medium">
              Desenvolvido com <Heart className="w-3 h-3 text-red-500 fill-current" /> para a comunidade acadêmica.
            </p>
            <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest">
              © 2026 SIGEA Platform • Todos os direitos reservados
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}