"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Globe, BellRing } from 'lucide-react';
import { motion } from 'motion/react';

export default function AppSettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('pt-BR');

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Ajustes do App</h1>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                {darkMode ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              </div>
              <div>
                <p className="font-bold text-gray-900">Modo Escuro</p>
                <p className="text-xs text-gray-500">Alterar aparência do sistema</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <BellRing className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Notificações Push</p>
                <p className="text-xs text-gray-500">Receber alertas no dispositivo</p>
              </div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Idioma</p>
                <p className="text-xs text-gray-500">Português (Brasil)</p>
              </div>
            </div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer"
            >
              <option value="pt-BR">PT-BR</option>
              <option value="en">EN-US</option>
              <option value="es">ES-ES</option>
            </select>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 font-medium">SIGEA Mobile • Versão 1.0.0</p>
        </div>
      </div>
    </div>
  );
}