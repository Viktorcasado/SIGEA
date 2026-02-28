import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { Activity } from '@/src/types';
import { ActivityRepository } from '@/src/repositories/ActivityRepository';
import { ArrowLeft, PlusCircle, Edit, Trash2, UserCheck } from 'lucide-react';

export default function ManageActivitiesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      ActivityRepository.listByEvent(eventId)
        .then(setActivities)
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  const handleDelete = (activityId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
      // Delete logic would go here if repository supported it
      alert('Funcionalidade de exclusão em desenvolvimento.');
    }
  };

  const canManage = user && ['servidor', 'gestor', 'admin'].includes(user.perfil);
  if (!canManage) navigate('/acesso-restrito');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to={`/evento/${eventId}/cronograma`} className="flex items-center text-gray-600 hover:text-gray-900 font-bold mb-8 group">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
        </div>
        Voltar ao Cronograma
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Gerenciar Atividades</h1>
            <p className="text-gray-500 font-medium">Controle o cronograma e a presença dos participantes.</p>
        </div>
        <Link to={`/evento/${eventId}/atividades/criar`} className="bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          <PlusCircle className="w-5 h-5" />
          Adicionar
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        ) : activities.length > 0 ? (
            activities.map(activity => (
                <div key={activity.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <UserCheck className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="font-black text-lg text-gray-900 tracking-tight leading-tight">{activity.titulo}</h3>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-gray-400 ml-13">
                                <span>{new Date(activity.data).toLocaleDateString('pt-BR')}</span>
                                <span>•</span>
                                <span>{activity.hora_inicio} - {activity.hora_fim}</span>
                                <span>•</span>
                                <span className="uppercase tracking-widest text-indigo-500">{activity.tipo}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Link 
                                to={`/evento/${eventId}/atividades/${activity.id}/presenca`}
                                className="flex items-center gap-2 px-5 py-3 bg-green-50 text-green-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-green-100 transition-colors"
                            >
                                <UserCheck className="w-4 h-4" />
                                Presença
                            </Link>
                            <button 
                                onClick={() => navigate(`/evento/${eventId}/atividades/${activity.id}/editar`)} 
                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-indigo-600 transition-colors"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleDelete(activity.id.toString())} 
                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-bold">Nenhuma atividade cadastrada para este evento.</p>
            </div>
        )}
      </div>
    </div>
  );
}