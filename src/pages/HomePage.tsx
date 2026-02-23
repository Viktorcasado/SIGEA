"use client";

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Compass, Award, Calendar, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useUser } from '@/src/contexts/UserContext';
import { supabase } from '@/src/integrations/supabase/client';
import { Event } from '@/src/types';
import EventCard from '@/src/components/EventCard';
import { motion } from 'motion/react';

export default function HomePage() {
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(10);

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
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            Olá, <span className="text-white drop-shadow-sm">{user?.nome.split(' ')[0] || 'Visitante'}</span>!
          </h1>
          <p className="text-gray-600 font-bold mt-1">O que vamos aprender hoje?</p>
        </div>
        <Link to="/notificacoes" className="relative p-4 glass-card rounded-2xl hover:scale-110 transition-transform">
          <Bell className="w-6 h-6 text-gray-800" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white border-2 border-white shadow-lg">
              {unreadCount}
            </span>
          )}
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden glass-panel rounded-[3rem] p-10 text-gray-900">
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-lg shadow-indigo-200">
            <Sparkles className="w-3 h-3" />
            Destaque da Semana
          </div>
          <h2 className="text-4xl font-black mb-4 leading-[1.1] tracking-tighter">Expanda seus horizontes acadêmicos.</h2>
          <p className="text-gray-600 font-bold mb-10 text-lg leading-relaxed">
            Descubra palestras, workshops e cursos certificados nos campi do IFAL.
          </p>
          <Link to="/explorar" className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:scale-105">
            Explorar Agora
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Próximos Eventos</h2>
            <p className="text-sm text-gray-600 font-bold">Não perca as datas de inscrição.</p>
          </div>
          <Link to="/explorar" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-[0.2em]">
            Ver Todos
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-72 h-64 glass-card rounded-[2.5rem] animate-pulse shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 no-scrollbar gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link to="/explorar" className="group glass-card p-8 rounded-[2.5rem] flex items-center justify-between hover:scale-[1.02]">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 group-hover:rotate-12 transition-transform">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <span className="block font-black text-gray-900 text-lg">Explorar</span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Eventos</span>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-indigo-600 transition-colors" />
        </Link>
        
        <Link to="/certificados" className="group glass-card p-8 rounded-[2.5rem] flex items-center justify-between hover:scale-[1.02]">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100 group-hover:rotate-12 transition-transform">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="block font-black text-gray-900 text-lg">Conquistas</span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Certificados</span>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </section>
    </div>
  );
}