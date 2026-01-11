import React, { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { Award, Download, ArrowLeft } from 'lucide-react';
import { Registration, Event } from '@/types';
import { useNavigate } from 'react-router-dom';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

export default function CertificatesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState<(Registration & { events: Event })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchCertificates();
    }, [user]);

    const fetchCertificates = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*, events:event_id(*)')
                .eq('user_id', user.id)
                .not('certificate_url', 'is', null);

            if (error) throw error;
            setCertificates(data as any || []);
        } catch (error) {
            console.error("Error fetching certificates", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto md:pl-72 pb-24">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-[hsl(var(--color-text-muted))] mb-6 hover:text-[hsl(var(--color-primary))]">
                <ArrowLeft className="mr-2" size={20} /> Voltar
            </button>

            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Award className="text-yellow-500" size={32} />
                    Meus Certificados
                </h1>
                <p className="text-[hsl(var(--color-text-muted))] mt-2">
                    Visualize e baixe certificados dos eventos que participou.
                </p>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
            ) : certificates.length === 0 ? (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <Award className="text-gray-400" size={40} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">Nenhum certificado disponível</h3>
                    <p className="text-gray-500 max-w-sm">
                        Você ainda não possui certificados emitidos. Participe de eventos e confirme sua presença para recebê-los.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <div key={cert.id} className="glass-card p-6 flex flex-col justify-between h-56 hover:shadow-lg transition-all group">
                            <div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">
                                    Participante
                                </span>
                                <h3 className="text-lg font-bold mt-3 leading-snug line-clamp-2">
                                    {cert.events.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    {new Date(cert.events.start_time).toLocaleDateString()}
                                </p>
                            </div>

                            <a
                                href={cert.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary flex items-center justify-center gap-2 w-full mt-4 opacity-90 hover:opacity-100"
                            >
                                <Download size={18} />
                                Baixar PDF
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
