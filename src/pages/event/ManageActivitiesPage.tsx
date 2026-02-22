import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Activity } from '@/src/types';
import { ActivityRepository } from '@/src/repositories/ActivityRepository';
import { ArrowLeft, PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

export default function ManageActivitiesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      setLoading(true);
      ActivityRepository.listByEvent(eventId)
        .then(setActivities)
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  const handleDelete = async (activityId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
      try {
        await ActivityRepository.deleteActivity(activityId);
        setActivities(prev => prev.filter(a => a.id !== activityId));
      } catch (error) {
        alert('Erro ao excluir atividade');
      }
    }
  };

  // Only organizers or admins can manage activities. Students should not have access.
  const canManage = user && (user.is_organizer || user.perfil === 'admin');
  
  useEffect(() => {
    if (!loading && !canManage) {
      navigate('/perfil');
    }
  }, [canManage, loading, navigate]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (!canManage) return null;

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
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma atividade cadastrada.
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('pt-BR')} | {new Date(activity.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
        )}
      </div>
    </div>
  );
}