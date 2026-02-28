import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Activity, ActivityType } from '@/src/types';
import { ActivityRepository } from '@/src/repositories/ActivityRepository';
import { ArrowLeft, Calendar, Clock, MapPin, AlignLeft, Type } from 'lucide-react';

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
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cargaHoraria = calculateDuration(horaInicio, horaFim);

  useEffect(() => {
    if (isEditing && eventId) {
        ActivityRepository.listByEvent(eventId).then(activities => {
            const activity = activities.find(a => a.id.toString() === activityId);
            if (activity) {
                setTitulo(activity.titulo);
                setTipo(activity.tipo);
                setData(activity.data);
                setHoraInicio(activity.hora_inicio);
                setHoraFim(activity.hora_fim);
                setLocal(activity.local);
                setDescricao(activity.descricao || '');
            }
        });
    }
  }, [isEditing, eventId, activityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    
    if (!titulo || !data || !horaInicio || !horaFim) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    setIsLoading(true);
    try {
        const activityData = { 
            titulo, 
            tipo, 
            data, 
            hora_inicio: horaInicio, 
            hora_fim: horaFim, 
            local, 
            descricao, 
            carga_horaria_minutos: cargaHoraria, 
            event_id: eventId 
        };
        
        if (isEditing) {
            // Update logic would go here if repository supported it
            alert('Funcionalidade de edição em desenvolvimento.');
        } else {
            await ActivityRepository.create(activityData);
            alert('Atividade criada com sucesso!');
        }
        navigate(`/evento/${eventId}/cronograma`);
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar atividade.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to={`/evento/${eventId}/cronograma`} className="flex items-center text-gray-600 hover:text-gray-900 font-bold mb-8 group">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
        </div>
        Voltar ao Cronograma
      </Link>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
            {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
        </h1>
        <p className="text-gray-500 font-medium mb-8">Defina os detalhes da atividade para o cronograma do evento.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Título da Atividade *</label>
                    <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            value={titulo} 
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Workshop de React Avançado"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                        <select 
                            value={tipo} 
                            onChange={(e) => setTipo(e.target.value as ActivityType)}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        >
                            <option value="palestra">Palestra</option>
                            <option value="oficina">Oficina</option>
                            <option value="minicurso">Minicurso</option>
                            <option value="mesa_redonda">Mesa Redonda</option>
                            <option value="seminario">Seminário</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Data *</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="date" 
                                value={data} 
                                onChange={(e) => setData(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Hora Início *</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="time" 
                                value={horaInicio} 
                                onChange={(e) => setHoraInicio(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Hora Fim *</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="time" 
                                value={horaFim} 
                                onChange={(e) => setHoraFim(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Local / Link</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            value={local} 
                            onChange={(e) => setLocal(e.target.value)}
                            placeholder="Auditório Principal ou Link do Meet"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                    <div className="relative">
                        <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea 
                            value={descricao} 
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Detalhes sobre o que será abordado..."
                            rows={4}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-indigo-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Carga Horária</p>
                        <p className="font-bold text-indigo-900">
                            {Math.floor(cargaHoraria / 60)}h {cargaHoraria % 60}min
                        </p>
                    </div>
                </div>
                <p className="text-xs text-indigo-400 font-medium italic">Calculada automaticamente</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex-1 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:bg-gray-300"
                >
                    {isLoading ? 'Salvando...' : 'Salvar Atividade'}
                </button>
                <button 
                    type="button" 
                    onClick={() => navigate(`/evento/${eventId}/cronograma`)} 
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                    Cancelar
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}