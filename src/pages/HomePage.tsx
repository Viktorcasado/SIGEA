"use client";

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Compass, Award, PlusCircle } from 'lucide-react';
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

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(10);

      if (!error && data) {
        setEvents(data.map(e => ({
          id: e.id,
          titulo: e.title,
          descricao: e.description || '',
          dataInicio: new Date(e.date),
          local: e.location || '',
          campus: e.campus || '',
          instituicao: 'IFAL',
          modalidade: 'Presencial',
          status: 'publicado'
        })));
      }
      setLoading(false);
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
        <Link to="/notificacoes" className="relative p-2 rounded-full hover:bg-gray-100">
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
        ) : (
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/explorar" className="flex items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
            <Compass className="w-6 h-6 text-indigo-600 mr-3" />
            <span className="font-semibold text-gray-700">Explorar eventos</span>
          </Link>
          <Link to="/certificados" className="flex items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
            <Award className="w-6 h-6 text-indigo-600 mr-3" />
            <span className="font-semibold text-gray-700">Meus certificados</span>
          </Link>
          {user?.is_organizer && (
             <Link to="/evento/criar" className="flex items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                <PlusCircle className="w-6 h-6 text-indigo-600 mr-3" />
                <span className="font-semibold text-gray-700">Criar evento</span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}