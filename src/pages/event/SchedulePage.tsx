import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Activity, Event } from '@/src/types';
import { ActivityRepositoryMock } from '@/src/repositories/ActivityRepository';
import { mockEvents } from '@/src/data/mock'; // Assuming event data is here
import { ArrowLeft, PlusCircle, Settings } from 'lucide-react';

export default function SchedulePage() {
  const { id: eventId } = useParams<{ id: string }>();
  const { user } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groupedActivities, setGroupedActivities] = useState<Record<string, Activity[]>>({});

  useEffect(() => {
    if (!eventId) return;
    const foundEvent = mockEvents.find(e => e.id === eventId);
    setEvent(foundEvent || null);
    ActivityRepositoryMock.listByEvent(eventId).then(data => {
      const sorted = [...data].sort((a, b) => new Date(a.data + 'T' + a.horaInicio).getTime() - new Date(b.data + 'T' + b.horaInicio).getTime());
      setActivities(sorted);
    });
  }, [eventId]);

  useEffect(() => {
    const groups = activities.reduce((acc, activity) => {
      const date = new Date(activity.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
    setGroupedActivities(groups);
  }, [activities]);

  const canManage = user && ['servidor', 'gestor', 'admin'].includes(user.perfil);

  if (!event) return <div>Evento não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to={`/evento/${eventId}`} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar aos Detalhes do Evento
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{event.titulo}</h1>
        <p className="text-gray-600">Cronograma de Atividades</p>
      </div>

      {canManage && (
        <div className="flex gap-4 mb-8">
          <Link to={`/evento/${eventId}/atividades/criar`} className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Adicionar Atividade
          </Link>
          <Link to={`/evento/${eventId}/atividades`} className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            <Settings className="w-5 h-5" />
            Gerenciar Atividades
          </Link>
        </div>
      )}

      {Object.keys(groupedActivities).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700">Nenhuma atividade cadastrada</h2>
            <p className="mt-1 text-gray-500">Adicione a primeira atividade para começar a montar o cronograma.</p>
        </div>
      ) : (
        Object.entries(groupedActivities).map(([date, acts]) => (
          <div key={date} className="mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-2 pb-2 border-b-2 border-indigo-500">{date}</h3>
            <div className="space-y-4">
              {acts.map(act => (
                <div key={act.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-bold text-indigo-700">{act.horaInicio} - {act.horaFim}</p>
                  <p className="font-semibold text-gray-900 mt-1">{act.titulo}</p>
                  <p className="text-sm text-gray-500">{act.tipo} - {act.localOuLink}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
