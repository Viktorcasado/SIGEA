import React, { useState, useEffect, useCallback } from 'react';
import { Certificate, Event } from '../types';
import CertificateCard from '../components/CertificateCard';
import { useUser } from '../contexts/UserContext';
import CertificateWidget from '../components/CertificateWidget';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';
import MainHeader from '../components/MainHeader';

interface CertificatesScreenProps {
    onNavigate: (screen: string) => void;
}

const CertificatesScreen: React.FC<CertificatesScreenProps> = ({ onNavigate }) => {
    const { user } = useUser();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
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
            // 1. Fetch certificates for the user to get event IDs
            const { data: certsData, error: certsError } = await supabase
                .from('certificates')
                .select('id, code, event_id')
                .eq('user_id', user.id);

            if (certsError) throw certsError;

            if (!certsData || certsData.length === 0) {
                setCertificates([]);
                return;
            }

            // 2. Get unique event IDs to avoid duplicate queries
            const eventIds = [...new Set(certsData.map(cert => cert.event_id))];

            // 3. Fetch all related events in a single query
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('id, title, date, category, location, image_url, workload, speakers, description, document_url')
                .in('id', eventIds);

            if (eventsError) throw eventsError;

            // 4. Create a Map for efficient event lookup
            const eventsMap = new Map(eventsData.map(e => [e.id, e]));

            // 5. Combine certificates with their event data
            const mappedCertificates = certsData.map((cert: any) => {
                // FIX: Cast `eventData` to `any` to resolve multiple 'property does not exist on type unknown' errors.
                const eventData: any = eventsMap.get(cert.event_id);
                if (!eventData) return null; // Gracefully handle if an event is not found

                let formattedDate = eventData.date || 'Data não informada';
                if (eventData.date) {
                    try {
                        const dateObj = new Date(eventData.date);
                        // Check if the date is valid. If not, use the original string.
                        if (!isNaN(dateObj.getTime())) {
                            formattedDate = new Intl.DateTimeFormat('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            }).format(dateObj).replace('.', '');
                        }
                    } catch (e) {
                        // Keep the original string if parsing fails
                        console.error("Could not parse date:", eventData.date);
                    }
                }
                
                const event: Event = {
                    id: eventData.id,
                    title: eventData.title,
                    date: formattedDate,
                    category: eventData.category,
                    location: eventData.location,
                    imageUrl: eventData.image_url,
                    hours: eventData.workload, // Map 'workload' from DB to 'hours' in type
                    speakers: eventData.speakers,
                    description: eventData.description,
                    document_url: eventData.document_url,
                };
                
                return {
                    id: cert.id,
                    eventTitle: event.title,
                    eventDate: event.date,
                    code: cert.code,
                    event: event,
                };
            }).filter((c): c is Certificate => c !== null); // Filter out nulls and type guard

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
                    <button
                        onClick={fetchCertificates}
                        className="mt-6 bg-ifal-green text-white font-semibold py-2 px-6 rounded-xl hover:bg-emerald-600 transition-colors"
                    >
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
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-sm flex flex-col items-center relative transition-transform duration-300 scale-95 animate-scale-up">
                        <button onClick={handleCloseModal} className="absolute -top-3 -right-3 text-white bg-gray-800/50 rounded-full w-8 h-8 flex items-center justify-center z-10">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        
                        <CertificateWidget certificate={selectedCertificate} user={user} />
                        
                        <button className="mt-6 w-full bg-ifal-green text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors">
                            Baixar Certificado (.PDF)
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
