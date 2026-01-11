import React, { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Award, User as UserIcon, LogOut, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

export default function Dashboard() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ upcoming: 0, certificates: 0 });

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    const fetchStats = async () => {
        if (!user) return;

        // Count Upcoming Events User is Registered For (Future)
        // Need to join registrations -> events and filter by start_time > now
        // This is complex in basic client-side supabase without complex filters or dedicated view.
        // Simplified: Count all registrations for now.
        const { count: regCount } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // Count Certificates (Registrations with certificate_url)
        const { count: certCount } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('certificate_url', 'is', null);

        setStats({
            upcoming: regCount || 0, // Using regCount as proxy for "Events" for now as 'future' filter requires Join
            certificates: certCount || 0
        });
    };

    return (
        <div className="min-h-screen pb-20 md:pb-0 md:pl-64 transition-all duration-300">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-[hsl(var(--color-surface))] border-r border-gray-200 hidden md:flex flex-col p-6 z-20">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="h-10 w-10 bg-[hsl(var(--color-primary))] rounded-lg"></div>
                    <span className="text-xl font-bold tracking-tight">SIGEA</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem icon={<Calendar />} label="Eventos" onClick={() => navigate('/dashboard')} active={window.location.pathname === '/dashboard'} />
                    <NavItem icon={<Award />} label="Certificados" onClick={() => navigate('/certificates')} active={window.location.pathname === '/certificates'} />
                    <NavItem icon={<UserIcon />} label="Perfil" onClick={() => navigate('/profile')} active={window.location.pathname === '/profile'} />
                    {profile?.papel === 'ORGANIZER' && (
                        <NavItem icon={<PlusCircle />} label="Criar Evento" />
                    )}
                </nav>

                <button onClick={signOut} className="flex items-center space-x-3 text-[hsl(var(--color-text-muted))] hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                    <span>Sair da conta</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="p-6 md:p-10 max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Olá, {profile?.nome_completo?.split(' ')[0] || 'Participante'}</h1>
                        <p className="text-[hsl(var(--color-text-muted))]">Bem-vindo ao portal de eventos do {profile?.campus && profile.campus !== 'Reitoria' ? `Campus ${profile.campus}` : 'IFAL'}.</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden md:hidden">
                        {profile?.foto_url ? (
                            <img src={profile.foto_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold">
                                {profile?.nome_completo?.charAt(0)}
                            </div>
                        )}
                    </div>
                </header>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Widget title="Minhas Inscrições" count={stats.upcoming} icon={<Calendar className="text-blue-500" />} />
                    <Widget title="Meus Certificados" count={stats.certificates} icon={<Award className="text-yellow-500" />} onClick={() => navigate('/certificates')} />
                    {/* Add more widgets */}
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Acontecendo Agora</h2>
                    <div className="glass-card p-6 h-48 flex items-center justify-center text-[hsl(var(--color-text-muted))]">
                        Nenhum evento no momento.
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full bg-[hsl(var(--color-surface)/0.9)] backdrop-blur-md border-t border-gray-200 p-4 flex justify-around md:hidden z-30 pb-safe">
                <NavIcon icon={<Calendar />} label="Eventos" onClick={() => navigate('/dashboard')} active />
                <NavIcon icon={<Award />} label="Certif." onClick={() => navigate('/certificates')} />
                {profile?.papel === 'ORGANIZER' && <NavIcon icon={<PlusCircle />} label="Novo" />}
                <NavIcon icon={<UserIcon />} label="Perfil" onClick={() => navigate('/profile')} />
            </nav>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${active ? 'bg-[hsl(var(--color-primary-light)/0.1)] text-[hsl(var(--color-primary-light))] font-semibold' : 'text-[hsl(var(--color-text-muted))] hover:bg-gray-50'}`}>
            {React.cloneElement(icon, { size: 20 })}
            <span>{label}</span>
        </button>
    );
}

function NavIcon({ icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center space-y-1 ${active ? 'text-[hsl(var(--color-primary-light))]' : 'text-[hsl(var(--color-text-muted))]'}`}>
            {React.cloneElement(icon, { size: 24 })}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

function Widget({ title, count, icon, onClick }: any) {
    return (
        <div onClick={onClick} className="glass-card p-6 flex flex-col justify-between h-40 hover:scale-[1.02] cursor-pointer transition-transform">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-white/50 rounded-lg">{icon}</div>
                <span className="text-3xl font-bold">{count}</span>
            </div>
            <span className="font-medium text-[hsl(var(--color-text))]">{title}</span>
        </div>
    );
}
