"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { Event } from '@/src/types';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, Eye, Calendar as CalendarIcon, Loader2, Award } from 'lucide-react';

const StatusBadge = ({ date }: { date: Date }) => {
  const now = new Date();
  const isPast = date < now;
  
  return (
    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
      isPast 
        ? 'bg-gray-100 text-gray-600 border-gray-200' 
        : 'bg-blue-100 text-blue-700 border-blue-200'
    }`}>
      {isPast ? 'Encerrado' : 'Publicado'}
    </span>
  );
};

export default function GestorEventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
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
          vagas: e.workload || 0
        }));
        setEvents(formattedEvents);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (!error) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        alert('Erro ao excluir evento: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Gerenciamento de Eventos</h1>
          <p className="text-gray-500 mt-1">Visualize e gerencie todos os eventos cadastrados.</p>
        </div>
        <Link 
          to="/evento/criar" 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <CalendarIcon className="w-5 h-5" />
          Novo Evento
        </Link>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">Carregando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Nenhum evento encontrado</h3>
            <p className="text-gray-500 mt-2">Comece criando seu primeiro evento acadêmico.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Evento</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {events.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{event.titulo}</div>
                        <div className="text-xs text-gray-500 font-medium">{event.campus}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {event.dataInicio.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge date={event.dataInicio} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/gestor/eventos/${event.id}/certificado-template`} 
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Configurar Certificado"
                        >
                          <Award className="w-5 h-5" />
                        </Link>
                        <Link 
                          to={`/evento/${event.id}`} 
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link 
                          to={`/evento/${event.id}/cronograma`} 
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Cronograma"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}