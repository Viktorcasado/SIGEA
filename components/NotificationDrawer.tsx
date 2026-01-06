import React from 'react';

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: any[];
    onMarkAsRead: (id: string) => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, notifications, onMarkAsRead }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <header className="p-6 pt-12 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Notificações</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suas atualizações recentes</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {notifications.length > 0 ? notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => onMarkAsRead(notif.id)}
                            className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${notif.read ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-60' : 'bg-white dark:bg-slate-800 border-primary/10 shadow-lg shadow-primary/5'}`}
                        >
                            {!notif.read && (
                                <div className="absolute top-5 right-5 size-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(19,91,236,0.5)]"></div>
                            )}
                            <div className="flex gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : 'bg-primary/10 text-primary'}`}>
                                    <span className="material-symbols-outlined">
                                        {notif.title.includes('Evento') ? 'event' : notif.title.includes('Perfil') ? 'person' : 'notifications'}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className={`font-black text-sm uppercase tracking-tight ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                        {notif.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{notif.text}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">{notif.time}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 px-6 text-center">
                            <span className="material-symbols-outlined text-7xl mb-4">notifications_off</span>
                            <p className="font-black uppercase tracking-widest text-xs">Tudo limpo por aqui!</p>
                        </div>
                    )}
                </div>

                <footer className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl uppercase tracking-widest text-xs active:scale-95 transition-all"
                    >
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default NotificationDrawer;
