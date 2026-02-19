import { useNotifications } from '@/src/contexts/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Award, Settings, ShieldCheck, BellOff } from 'lucide-react';
import { Notification } from '@/src/types';

const NotificationIcon = ({ tipo }: { tipo: Notification['tipo'] }) => {
  const icons = {
    evento: <Calendar className="w-6 h-6 text-blue-500" />,
    certificado: <Award className="w-6 h-6 text-green-500" />,
    sistema: <Settings className="w-6 h-6 text-gray-500" />,
    vinculo: <ShieldCheck className="w-6 h-6 text-purple-500" />,
  };
  return <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">{icons[tipo]}</div>;
};

const TimeAgo = ({ date }: { date: Date }) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `Há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `Há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `Há ${Math.floor(interval)} dias`;
    interval = seconds / 3600;
    if (interval > 1) return `Há ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `Há ${Math.floor(interval)} minutos`;
    return 'Agora mesmo';
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.referenciaId) {
        if (notification.tipo === 'evento') {
            navigate(`/evento/${notification.referenciaId}`);
        } else if (notification.tipo === 'certificado') {
            // Assuming certificate detail page would be /certificados/:id
            navigate('/certificados'); 
        }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar ao Início
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <button onClick={markAllAsRead} className="text-sm font-semibold text-indigo-600 hover:underline">
            Marcar todas como lidas
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-16 h-16 mx-auto text-gray-300" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Você não possui notificações</h2>
            <p className="mt-1 text-gray-500">Novas atualizações aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                onClick={() => handleNotificationClick(notification)}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer relative"
              >
                {!notification.lida && <span className='absolute top-4 right-4 w-2.5 h-2.5 bg-indigo-500 rounded-full'></span>}
                <NotificationIcon tipo={notification.tipo} />
                <div className='flex-grow'>
                    <p className='font-semibold text-gray-800'>{notification.titulo}</p>
                    <p className='text-sm text-gray-600'>{notification.mensagem}</p>
                    <p className='text-xs text-gray-400 mt-1'><TimeAgo date={notification.createdAt} /></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
