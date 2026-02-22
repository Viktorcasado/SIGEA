"use client";

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Compass, Award, Calendar, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useUser } from '@/src/contexts/UserContext';
import { supabase } from '@/src/integrations/supabase/client';
import { Event } from '@/src/types';
import EventCard from '@/src/components/EventCard';

export default function HomePage() {
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setError(null);
        const { data, error: supabaseError } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true })
          .limit(10);

        if (supabaseError) throw supabaseError;

        if (data) {
          setEvents(data.map(e => ({
            id: e.id,
            titulo: e.title,
            descricao: e.description || '',
            dataInicio: new Date(e.date),
            local: e.location || '',
            campus: e.campus || '',
            instituicao: 'IFAL',
            modalidade: 'Presencial',
            status: 'publicado',
            carga_horaria: e.workload || 0
          })));
        }
      } catch (err: any) {
        console.error("Erro ao carregar eventos:", err);
        setError("Não foi possível carregar os eventos. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Olá, {user?.nome || 'Visitante'}</h1>
          <p className="text-gray-500">Confira os próximos eventos</p>
        </div>
        <Link to="/notificacoes" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>
      </header>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Próximos eventos</h2>
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map(i => <div key={i} className="w-64 h-40 bg-gray-100 animate-pulse rounded-xl flex-shrink-0" />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm font-bold text-red-600 underline">Tentar novamente</button>
          </div>
        ) : events.length > 0 ? (
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum evento disponível no momento.</p>
            <Link to="/explorar" className="text-indigo-600 text-sm font-bold mt-2 inline-block hover:underline">
              Explorar todos os eventos
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/explorar" className="flex items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent">
            <Compass className="w-6 h-6 text-indigo-600 mr-3" />
            <span className="font-semibold text-gray-700">Explorar eventos</span>
          </Link>
          <Link to="/certificados" className="flex items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent">
            <Award className="w-6 h-6 text-indigo-600 mr-3" />
            <span className="font-semibold text-gray-700">Meus certificados</span>
          </Link>
        </div>
      </section>
    </div>
  );
}