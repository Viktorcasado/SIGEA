"use client";

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Fingerprint, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function SecurityPage() {
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleToggleBiometry = () => {
    if (!biometryEnabled) {
      setIsActivating(true);
      // Simulação de ativação de WebAuthn/Passkey
      setTimeout(() => {
        setBiometryEnabled(true);
        setIsActivating(false);
        alert('Acesso biométrico configurado com sucesso neste dispositivo!');
      }, 1500);
    } else {
      if (window.confirm('Deseja desativar o acesso por biometria?')) {
        setBiometryEnabled(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Segurança</h1>
              <p className="text-gray-500 text-sm">Gerencie sua senha e métodos de acesso.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Senha Atual</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nova Senha</label>
                <input type="password" placeholder="Mínimo 6 caracteres" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nova Senha</label>
                <input type="password" placeholder="Repita a senha" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
            </div>
            <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-2">
              Atualizar Senha
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${biometryEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Acesso por Biometria</h3>
                <p className="text-xs text-gray-500">Use Touch ID ou Face ID para entrar rápido</p>
              </div>
            </div>
            <button 
              onClick={handleToggleBiometry}
              disabled={isActivating}
              className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${biometryEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <motion.div 
                animate={{ x: biometryEnabled ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center"
              >
                {isActivating && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
              </motion.div>
            </button>
          </div>
          
          {biometryEnabled && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <p className="text-xs text-emerald-800 font-medium">
                Este dispositivo está autorizado para login biométrico.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}