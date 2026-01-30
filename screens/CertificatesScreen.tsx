
import React, { useState, useEffect, useCallback } from 'react';
import { Certificate, Event } from '../types';
import CertificateCard from '../components/CertificateCard';
import { useUser } from '../contexts/UserContext';
import CertificateWidget from '../components/CertificateWidget';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';
import MainHeader from '../components/MainHeader';
import { generateCertificatePDF } from '../services/pdfService';

interface CertificatesScreenProps {
    onNavigate: (screen: string) => void;
}

const CertificatesScreen: React.FC<CertificatesScreenProps> = ({ onNavigate }) => {
    const { user } = useUser();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

    const fetchCertificates = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const { data: certsData, error: certsError } = await supabase
                .from('certificates')
                .select('id, code, event_id')
                .eq('user_id', user.id);

            if (certsError) throw certsError;

            if (!certsData || certsData.length === 0) {
                setCertificates([]);
                setLoading(false);
                return;
            }

            const eventIds = [...new Set(certsData.map(cert => cert.event_id))];

            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*') // Buscamos todos os campos, incluindo cert_pos_x e cert_pos_y
                .in('id', eventIds);

            if (eventsError) throw eventsError;

            const eventsMap = new Map(eventsData.map(e => [e.id, e]));

            const mappedCertificates = certsData.map((cert: any) => {
                const eventData: any = eventsMap.get(cert.event_id);
                if (!eventData) return null;

                let formattedDate = eventData.date || 'Data não informada';
                if (eventData.date) {
                    try {
                        const dateObj = new Date(eventData.date);
                        if (!isNaN(dateObj.getTime())) {
                            formattedDate = new Intl.DateTimeFormat('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            }).format(dateObj).replace('.', '');
                        }
                    } catch (e) {
                        console.error("Could not parse date:", eventData.date);
                    }
                }
                
                // Fix: Added missing workload property to satisfy Event interface
                const event: Event = {
                    id: eventData.id,
                    title: eventData.title,
                    date: formattedDate,
                    category: eventData.category,
                    location: eventData.location,
                    imageUrl: eventData.image_url,
                    workload: eventData.workload,
                    hours: eventData.workload,
                    speakers: eventData.speakers,
                    description: eventData.description,
                    document_url: eventData.document_url,
                    cert_pos_x: eventData.cert_pos_x, // Importante para o PDF
                    cert_pos_y: eventData.cert_pos_y,
                    cert_orientation: eventData.cert_orientation,
                };
                
                return {
                    id: cert.id,
                    eventTitle: event.title,
                    eventDate: event.date,
                    code: cert.code,
                    event: event,
                };
            }).filter((c): c is Certificate => c !== null);

            setCertificates(mappedCertificates);

        } catch (e: any) {
            console.error("ERRO SUPABASE:", e.message);
            setError("Não foi possível carregar os certificados.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const handleDownload = async (certificate: Certificate) => {
      if (!user) return;
      setDownloading(true);
      try {
        await generateCertificatePDF(certificate, user);
      } catch (e) {
        console.error(e);
        alert("Erro ao gerar o PDF. Verifique sua conexão.");
      } finally {
        setDownloading(false);
      }
    };

    const handleViewCertificate = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
    };
    
    const handleCloseModal = () => {
        setSelectedCertificate(null);
    }
    
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ifal-green"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 px-4">
                    <Icon name="life-buoy" className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Ocorreu um Erro</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm mx-auto">{error}</p>
                    <button onClick={fetchCertificates} className="mt-6 bg-ifal-green text-white font-semibold py-2 px-6 rounded-xl hover:bg-emerald-600 transition-colors">
                        Tentar Novamente
                    </button>
                </div>
            );
        }
        
        if (certificates.length === 0) {
            return (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <Icon name="star" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold">Nenhum Certificado Encontrado</h3>
                    <p>Seus certificados aparecerão aqui após a participação nos eventos.</p>
                </div>
            );
        }
        
        return (
            <div className="space-y-4">
                {certificates.map(cert => (
                    <CertificateCard key={cert.id} certificate={cert} onView={() => handleViewCertificate(cert)} />
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <MainHeader onNavigate={onNavigate} />
            <main className="p-6">
                {renderContent()}
            </main>

            {selectedCertificate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={handleCloseModal}>
                    <div className="relative w-full max-w-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                        <button onClick={handleCloseModal} className="absolute -top-2 -right-2 text-white bg-black/30 rounded-full w-8 h-8 flex items-center justify-center z-10 active:scale-90 transition-transform">
                           <Icon name="close" className="w-4 h-4" />
                        </button>
                        
                        <CertificateWidget certificate={selectedCertificate} user={user} />
                        
                        <button 
                            onClick={() => handleDownload(selectedCertificate)}
                            disabled={downloading}
                            className="mt-4 w-full bg-ifal-green text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-ifal-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                        >
                            {downloading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Gerando Documento...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="calendar" className="w-5 h-5" />
                                    <span>Baixar Certificado (.PDF)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); } to { transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default CertificatesScreen;
