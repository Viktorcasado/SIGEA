"use client";

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Activity, Event } from '@/src/types';
import { ActivityRepository } from '@/src/repositories/ActivityRepository';
import { supabase } from '@/src/integrations/supabase/client';
import { ArrowLeft, PlusCircle, Settings, Clock, MapPin, Loader2, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { shareContent, formatActivityShare } from '@/src/utils/share';

export default function SchedulePage() {
  const { id: eventId } = useParams<{ id: string }>();
  const { user } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      setLoading(true);
      
      try {
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventData) {
          setEvent({
            id: eventData.id,
            titulo: eventData.title,
            descricao: eventData.description || '',
            dataInicio: new Date(eventData.date),
            local: eventData.location || '',
            campus: eventData.campus || '',
            instituicao: 'IFAL',
            modalidade: 'Presencial',
            status: 'publicado'
          });
        }

        const acts = await ActivityRepository.listByEvent(eventId);
        setActivities(acts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.date).toLocaleDateString('pt-BR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const canManage = user && (user.is_organizer || user.perfil === 'aluno');

  const handleShareActivity = (activity: Activity) => {
    if (event) {
      shareContent(formatActivityShare(event, activity));
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  if (!event) return <div className="text-center py-20">Evento não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to={`/evento/${eventId}`} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar aos Detalhes
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8">
        <h1 className="text-3xl font-black text-gray-900">{event.titulo}</h1>
        <p className="text-gray-500 mt-1">Cronograma de Atividades</p>
      </div>

      {canManage && (
        <div className="flex gap-4 mb-8">
          <Link to={`/evento/${eventId}/atividades/criar`} className="flex-1 bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
            <PlusCircle className="w-5 h-5" />
            Adicionar Atividade
          </Link>
          <Link to={`/evento/${eventId}/atividades`} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2">
            <Settings className="w-5 h-5" />
            Gerenciar
          </Link>
        </div>
      )}

      {Object.keys(groupedActivities).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <Clock className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-700">Nenhuma atividade</h2>
            <p className="text-gray-500 mt-1">O cronograma ainda está sendo montado.</p>
        </div>
      ) : (
        Object.entries(groupedActivities).map(([date, acts]) => (
          <div key={date} className="mb-8">
            <h3 className="font-black text-sm text-indigo-600 uppercase tracking-widest mb-4 px-2">{date}</h3>
            <div className="space-y-4">
              {acts.map(act => (
                <motion.div 
                  key={act.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-900 text-lg">{act.title}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          {new Date(act.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(act.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {act.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleShareActivity(act)}
                      className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Compartilhar Atividade"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase">
                        {act.hours}h
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}