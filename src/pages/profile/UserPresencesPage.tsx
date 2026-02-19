"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Presenca, Activity } from '@/src/types';
import { PresencaRepositoryMock } from '@/src/repositories/PresencaRepository';
import { ActivityRepositoryMock } from '@/src/repositories/ActivityRepository';
import { ArrowLeft, CheckCircle, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function UserPresencesPage() {
  const { user } = useUser();
  const [presences, setPresences] = useState<Presenca[]>([]);
  const [activities, setActivities] = useState<Record<string, Activity>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const userPresences = await PresencaRepositoryMock.listByUser(user.id);
        setPresences(userPresences);
        
        // Em um cenário real, buscaríamos as atividades relacionadas
        // Aqui vamos apenas simular o carregamento
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Presenças</h1>
        <p className="text-gray-500 mt-1">Histórico de atividades confirmadas</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : presences.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Nenhuma presença registrada</h2>
          <p className="text-gray-500 mt-2">Suas presenças em atividades aparecerão aqui após a confirmação dos organizadores.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {presences.map((presence, index) => (
            <motion.div 
              key={presence.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Atividade Confirmada</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(presence.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded-md">
                  Presente
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}