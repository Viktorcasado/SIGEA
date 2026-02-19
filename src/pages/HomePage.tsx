import { Link } from 'react-router-dom';
import { Bell, Compass, Award, PlusCircle } from 'lucide-react';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { mockUser, mockProximosEventos, mockAvisos } from '@/src/data/mock';
import EventCard from '@/src/components/EventCard';

export default function HomePage() {
  const user = mockUser;
  const { unreadCount } = useNotifications();

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Próximos Eventos */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Próximos eventos</h2>
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4">
          {mockProximosEventos.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Meus Eventos */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Meus eventos</h2>
        <div>
          {mockProximosEventos.slice(0, 3).map(event => (
            <EventCard key={event.id} event={event} variant="vertical" />
          ))}
        </div>
      </section>

      {/* Avisos */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Avisos</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            {mockAvisos.map(aviso => (
                <div key={aviso.id} className="text-sm text-gray-700 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                    {aviso.texto}
                </div>
            ))}
        </div>
      </section>

      {/* Ações Rápidas */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/explorar" className="flex items-center text-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <Compass className="w-6 h-6 text-indigo-600 mr-3" />
            <span className="font-semibold text-gray-700">Explorar eventos</span>
          </Link>
          <Link to="/certificados" className="flex items-center text-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <Award className="w-6 h-6 text-indigo-600 mr-3" />
            <span className="font-semibold text-gray-700">Meus certificados</span>
          </Link>
          {user.perfil !== 'aluno' && (
             <Link to="/evento/criar" className="flex items-center text-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <PlusCircle className="w-6 h-6 text-indigo-600 mr-3" />
                <span className="font-semibold text-gray-700">Criar evento</span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
