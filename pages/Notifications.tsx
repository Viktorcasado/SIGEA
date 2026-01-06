import React from 'react';

interface NotificationsProps {
    navigateTo: (page: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ navigateTo }) => {
    const notifications = [
        {
            id: 1,
            title: 'Inscrição Confirmada',
            message: 'Sua inscrição no evento "Hackathon IFAL" foi confirmada com sucesso!',
            time: 'Há 2 horas',
            read: false,
            type: 'success'
        },
        {
            id: 2,
            title: 'Novo Evento Disponível',
            message: 'Confira o novo workshop de React Native que acaba de ser lançado.',
            time: 'Ontem',
            read: true,
            type: 'info'
        },
        {
            id: 3,
            title: 'Lembrete de Evento',
            message: 'O evento "Semana de Tecnologia" começa em breve. Prepare-se!',
            time: 'Há 2 dias',
            read: true,
            type: 'warning'
        }
    ];

    return (
        <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-20">
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-gray-800 p-4 flex items-center justify-between">
                <button onClick={() => navigateTo('home')} className="size-11 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined font-black">arrow_back</span>
                </button>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Notificações</h2>
                <div className="w-11"></div>
            </header>

            <main className="p-4 space-y-4">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-4 rounded-3xl border-2 transition-all active:scale-95 ${notif.read
                                ? 'bg-transparent border-slate-200 dark:border-slate-800 opacity-70'
                                : 'bg-white dark:bg-surface-dark border-primary/20 shadow-lg shadow-primary/5'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 size-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                    notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                        'bg-blue-100 text-blue-600'
                                }`}>
                                <span className="material-symbols-outlined text-xl filled">
                                    {notif.type === 'success' ? 'check_circle' :
                                        notif.type === 'warning' ? 'event_upcoming' :
                                            'info'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-black uppercase text-xs ${notif.read ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{notif.time}</span>
                                </div>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>
                        </div>
                        {!notif.read && (
                            <div className="mt-3 flex justify-end">
                                <button className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline">Marcar como lida</button>
                            </div>
                        )}
                    </div>
                ))}

                <div className="pt-8 flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <span className="material-symbols-outlined text-4xl mb-2">done_all</span>
                    <p className="text-xs font-bold uppercase tracking-widest">Tudo lido por enquanto</p>
                </div>
            </main>
        </div>
    );
};

export default Notifications;
