import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/src/services/supabase';
import { ArrowLeft, Search, UserCheck, UserX, Loader2, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface Participant {
    id: string;
    full_name: string;
    email: string;
    present: boolean;
}

export default function MarkPresencePage() {
  const { id: eventId, activityId } = useParams<{ id: string; activityId: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTitle, setActivityTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!activityId || !eventId) return;
      
      try {
        // Fetch activity details
        const { data: activity } = await supabase
            .from('activities')
            .select('title')
            .eq('id', activityId)
            .single();
        
        if (activity) setActivityTitle(activity.title);

        // Fetch participants (those registered for the event)
        const { data: registrations, error } = await supabase
            .from('event_registrations')
            .select(`
                user_id,
                profiles:user_id (
                    full_name
                )
            `)
            .eq('event_id', eventId)
            .eq('status', 'confirmada');

        if (error) throw error;

        // Fetch current presence for this activity
        const { data: presences } = await supabase
            .from('presencas')
            .select('user_id, presente')
            .eq('activity_id', activityId);

        const presenceMap = new Map(presences?.map(p => [p.user_id, p.presente]) || []);

        const mappedParticipants = (registrations || []).map((reg: any) => ({
            id: reg.user_id,
            full_name: reg.profiles?.full_name || 'Usuário sem nome',
            email: '', // Email usually not exposed in public profiles join
            present: presenceMap.get(reg.user_id) || false
        }));

        setParticipants(mappedParticipants);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, activityId]);

  const togglePresence = async (userId: string, currentStatus: boolean) => {
    try {
        const newStatus = !currentStatus;
        
        const { error } = await supabase
            .from('presencas')
            .upsert({
                activity_id: activityId,
                user_id: userId,
                presente: newStatus
            }, { onConflict: 'activity_id,user_id' });

        if (error) throw error;

        setParticipants(prev => prev.map(p => 
            p.id === userId ? { ...p, present: newStatus } : p
        ));
    } catch (err) {
        console.error(err);
        alert('Erro ao atualizar presença.');
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to={`/evento/${eventId}/atividades`} className="flex items-center text-gray-600 hover:text-gray-900 font-bold mb-8 group">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
        </div>
        Voltar para Atividades
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Controle de Presença</h1>
        <p className="text-gray-500 font-bold mt-1">{activityTitle || 'Carregando atividade...'}</p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar participante pelo nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                />
            </div>
        </div>

        <div className="divide-y divide-gray-50">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-bold">Carregando lista...</p>
                </div>
            ) : filteredParticipants.length > 0 ? (
                filteredParticipants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black">
                                {participant.full_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 tracking-tight">{participant.full_name}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inscrito no Evento</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => togglePresence(participant.id, participant.present)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                                participant.present 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                            }`}
                        >
                            {participant.present ? (
                                <>
                                    <UserCheck className="w-4 h-4" />
                                    Presente
                                </>
                            ) : (
                                <>
                                    <UserX className="w-4 h-4" />
                                    Faltou
                                </>
                            )}
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Nenhum participante encontrado</h3>
                    <p className="text-gray-500 font-bold mt-2">Verifique se há inscritos confirmados no evento.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}