"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Event } from '@/src/types';
import { supabase } from '@/src/integrations/supabase/client';
import { ArrowLeft, PlusCircle, Calendar, MapPin, Settings, Award } from 'lucide-react';
import { motion } from 'motion/react';

export default function MyEventsPage() {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
      } else {
        const formattedEvents: Event[] = data.map(e => ({
          id: e.id,
          titulo: e.title,
          descricao: e.description || '',
          dataInicio: new Date(e.date),
          local: e.location || '',
          campus: e.campus || '',
          instituicao: 'IFAL',
          modalidade: 'Presencial',
          status: 'publicado',
          vagas: 0,
          carga_horaria: e.workload || 0
        }));
        setEvents(formattedEvents);
      }
      setLoading(false);
    };

    fetchMyEvents();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Eventos</h1>
          <p className="text-gray-500 mt-1">Gerencie os eventos que você organizou</p>
        </div>
        <Link 
          to="/evento/criar" 
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <PlusCircle className="w-5 h-5" />
          Novo Evento
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Você ainda não criou eventos</h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">Comece agora mesmo criando seu primeiro evento acadêmico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black uppercase px-2 py-1 rounded-md bg-blue-50 text-blue-600">
                    {event.status}
                  </span>
                  <div className="flex gap-2">
                    <Link 
                      to={`/gestor/eventos/${event.id}/certificado-template`} 
                      className="text-gray-400 hover:text-indigo-600"
                      title="Configurar Certificado"
                    >
                      <Award className="w-5 h-5" />
                    </Link>
                    <Link to={`/evento/${event.id}/cronograma`} className="text-gray-400 hover:text-indigo-600">
                      <Settings className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.titulo}</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {event.dataInicio.toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.campus}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <Link to={`/evento/${event.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                  Ver Detalhes
                </Link>
                <Link to={`/evento/${event.id}/atividades`} className="text-sm font-bold text-gray-600 hover:text-gray-900">
                  Gerenciar Atividades
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}