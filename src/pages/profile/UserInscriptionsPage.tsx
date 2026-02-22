"use client";

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/src/contexts/UserContext';
import { useToast } from '@/src/contexts/ToastContext';
import { Inscricao } from '@/src/types';
import { supabase } from '@/src/integrations/supabase/client';
import { ArrowLeft, Calendar, MapPin, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function UserInscriptionsPage() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [inscriptions, setInscriptions] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInscriptions = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', user.id);

    if (!error && data) {
      const formatted: Inscricao[] = data.map(reg => ({
        id: reg.id,
        eventoId: reg.event_id,
        userId: reg.user_id,
        status: reg.status,
        createdAt: new Date(reg.registered_at),
        event: {
          id: reg.events.id,
          titulo: reg.events.title,
          dataInicio: new Date(reg.events.date),
          campus: reg.events.campus || '',
          instituicao: 'IFAL',
          local: reg.events.location || '',
          descricao: reg.events.description || '',
          modalidade: 'Presencial',
          status: 'publicado',
          carga_horaria: reg.events.workload || 0
        }
      }));
      setInscriptions(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInscriptions();
  }, [user]);

  const handleCancel = async (eventId: string) => {
    if (!user || !window.confirm('Deseja realmente cancelar esta inscrição?')) return;

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (!error) {
      setInscriptions(prev => prev.filter(i => i.eventoId !== eventId));
      showToast('Inscrição cancelada com sucesso.');
    } else {
      showToast('Erro ao cancelar inscrição.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">Minhas Inscrições</h1>
      <p className="text-gray-500 mt-1">Eventos que você confirmou participação</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : inscriptions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 mt-8">
            <Calendar className="w-16 h-16 mx-auto text-gray-300" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Nenhuma inscrição encontrada</h2>
            <Link to="/explorar" className="mt-6 inline-block bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl">
                Explorar Eventos
            </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {inscriptions.map((reg, index) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4"
            >
              <Link to={`/evento/${reg.eventoId}`} className="flex-1">
                <h3 className="font-bold text-xl text-gray-900">{reg.event?.titulo}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {reg.event?.dataInicio.toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {reg.event?.campus}
                  </div>
                </div>
              </Link>
              <button 
                onClick={() => handleCancel(reg.eventoId)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Cancelar Inscrição"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}