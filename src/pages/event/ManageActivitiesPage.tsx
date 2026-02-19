import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Activity } from '@/src/types';
import { ActivityRepositoryMock } from '@/src/repositories/ActivityRepository';
import { ArrowLeft, PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function ManageActivitiesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (eventId) {
      ActivityRepositoryMock.listByEvent(eventId).then(setActivities);
    }
  }, [eventId]);

  const handleDelete = (activityId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
      if (!eventId) return;
      ActivityRepositoryMock.deleteActivity(eventId, activityId).then(() => {
        setActivities(prev => prev.filter(a => a.id !== activityId));
      });
    }
  };

  const canManage = user && ['servidor', 'gestor', 'admin'].includes(user.perfil);
  if (!canManage) navigate('/acesso-restrito');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to={`/evento/${eventId}/cronograma`} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar ao Cronograma
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Atividades</h1>
        <Link to={`/evento/${eventId}/atividades/criar`} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Adicionar
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="space-y-2 p-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800">{activity.titulo}</p>
                <p className="text-sm text-gray-500">{activity.data} | {activity.horaInicio} - {activity.horaFim}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/evento/${eventId}/atividades/${activity.id}/editar`)} className="p-2 text-gray-500 hover:text-indigo-600">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(activity.id)} className="p-2 text-gray-500 hover:text-red-600">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
