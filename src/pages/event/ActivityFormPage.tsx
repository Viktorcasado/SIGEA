import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Activity, ActivityType } from '@/src/types';
import { ActivityRepositoryMock } from '@/src/repositories/ActivityRepository';
import { ArrowLeft } from 'lucide-react';

const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    if (endTime <= startTime) return 0;
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60);
};

export default function ActivityFormPage() {
  const { id: eventId, activityId } = useParams<{ id: string; activityId?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(activityId);

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<ActivityType>('palestra');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [localOuLink, setLocalOuLink] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cargaHoraria = calculateDuration(horaInicio, horaFim);

  useEffect(() => {
    if (isEditing && eventId) {
        ActivityRepositoryMock.listByEvent(eventId).then(activities => {
            const activity = activities.find(a => a.id === activityId);
            if (activity) {
                setTitulo(activity.titulo);
                setTipo(activity.tipo);
                setData(activity.data);
                setHoraInicio(activity.horaInicio);
                setHoraFim(activity.horaFim);
                setLocalOuLink(activity.localOuLink);
                setResponsavel(activity.responsavel || '');
            }
        });
    }
  }, [isEditing, eventId, activityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setIsLoading(true);
    const activityData = { titulo, tipo, data, horaInicio, horaFim, localOuLink, responsavel, cargaHorariaMinutos: cargaHoraria };
    
    const promise = isEditing
      ? ActivityRepositoryMock.updateActivity({ ...activityData, id: activityId!, eventoId: eventId })
      : ActivityRepositoryMock.createActivity(eventId, activityData);

    promise.then(() => {
        setIsLoading(false);
        alert(`Atividade ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
        navigate(`/evento/${eventId}/cronograma`);
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to={`/evento/${eventId}/cronograma`} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar ao Cronograma
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Editar Atividade' : 'Criar Nova Atividade'}</h1>

      <form onSubmit={handleSubmit} className="mt-8 bg-white p-6 rounded-2xl shadow-lg space-y-6">
        {/* Form fields will go here */}
        <div>Carga Horária Calculada: {Math.floor(cargaHoraria / 60)}h {cargaHoraria % 60}min</div>
        <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate(`/evento/${eventId}/cronograma`)} className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-semibold">Cancelar</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 font-semibold">{isLoading ? 'Salvando...' : 'Salvar Atividade'}</button>
        </div>
      </form>
    </div>
  );
}
