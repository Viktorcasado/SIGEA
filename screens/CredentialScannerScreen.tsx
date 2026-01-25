import React, { useState, useCallback, useRef, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import QrScanner from '../components/QrScanner';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';
import { Event } from '../types';

interface CredentialScannerScreenProps {
  event: Event;
  onBack: () => void;
}

type ScanStatus = 'scanning' | 'loading' | 'success' | 'error';

interface ScannedData {
    name: string;
}

const CredentialScannerScreen: React.FC<CredentialScannerScreenProps> = ({ event, onBack }) => {
    const [status, setStatus] = useState<ScanStatus>('scanning');
    const [scannedData, setScannedData] = useState<ScannedData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [flashOn, setFlashOn] = useState(false); // Note: Flash control is experimental on web

    const successSoundRef = useRef<HTMLAudioElement>(null);
    const errorSoundRef = useRef<HTMLAudioElement>(null);

    // This effect ensures we don't keep the modal open if the component unmounts
    useEffect(() => {
        return () => {
            // Cleanup logic if needed
        };
    }, []);

    const handleScanSuccess = useCallback(async (decodedText: string) => {
        if (status !== 'scanning') return; // Prevent multiple scans while processing

        setStatus('loading');
        
        let userId;
        try {
            // Basic validation: check if it's a UUID which is what we expect for user_id
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(decodedText)) {
                throw new Error('QR code com formato inválido.');
            }
            userId = decodedText;
        } catch (e: any) {
            setErrorMessage(e.message || 'Código QR inválido.');
            setStatus('error');
            errorSoundRef.current?.play();
            return;
        }

        try {
            const { data, error } = await supabase
                .from('event_registrations')
                .update({ status: 'Present', updated_at: new Date().toISOString() })
                .match({ user_id: userId, event_id: event.id })
                .select('profiles(full_name)')
                .single();

            if (error || !data) {
                setErrorMessage('Inscrição não encontrada para este evento ou já registrada.');
                setStatus('error');
                errorSoundRef.current?.play();
            } else {
                setScannedData({ name: (data.profiles as any).full_name });
                setStatus('success');
                successSoundRef.current?.play();
            }
        } catch (err: any) {
            setErrorMessage(err.message);
            setStatus('error');
            errorSoundRef.current?.play();
        }
    }, [event.id, status]);
    
    const handleScanFailure = useCallback((error: string) => {
        // Silently ignore failures. The scanner will keep trying.
        // This prevents console spam when no QR code is in view.
    }, []);

    const resetScanner = () => {
        setStatus('scanning');
        setScannedData(null);
        setErrorMessage('');
    };

    const isModalOpen = status !== 'scanning';
    const showScanner = status === 'scanning';

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <PageHeader title="Credenciamento" onBack={onBack} />
            
            <audio ref={successSoundRef} src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..." />
            <audio ref={errorSoundRef} src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..." />

            <main className="flex-grow relative">
                <div className={`w-full h-full transition-opacity duration-300 ${showScanner ? 'opacity-100' : 'opacity-0'}`}>
                    {showScanner && (
                        <QrScanner 
                            onScanSuccess={handleScanSuccess} 
                            onScanFailure={handleScanFailure} 
                        />
                    )}
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8">
                    <div className={`relative w-full max-w-xs aspect-square border-4 rounded-2xl transition-colors duration-300 ${status === 'error' ? 'border-red-500 animate-pulse-red' : 'border-white/80'} shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] overflow-hidden`}>
                        <div className="absolute left-0 w-full h-1.5 bg-ifal-green shadow-[0_0_10px_2px_rgba(0,145,63,0.7)] animate-scan-line"></div>
                    </div>
                    <p className="text-white text-center font-semibold mt-8 text-lg">Aponte para o QR Code do participante</p>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <button 
                      onClick={() => setFlashOn(!flashOn)}
                      className="w-16 h-16 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto"
                    >
                        <Icon name={flashOn ? 'bolt' : 'bolt-slash'} className="w-7 h-7" />
                    </button>
                </div>
            </main>
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in" onClick={resetScanner}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 text-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        {status === 'loading' && (
                            <>
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ifal-green mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-300 font-semibold">Validando Inscrição...</p>
                            </>
                        )}
                        {status === 'success' && scannedData && (
                            <>
                                <div className="w-20 h-20 bg-ifal-green/10 rounded-full mx-auto flex items-center justify-center">
                                    <Icon name="check" className="w-12 h-12 text-ifal-green" />
                                </div>
                                <h2 className="text-xl font-semibold text-ifal-green mt-4">ENTRADA LIBERADA</h2>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">{scannedData.name}</p>
                            </>
                        )}
                         {(status === 'error') && (
                            <>
                                <div className="w-20 h-20 bg-red-500/10 rounded-full mx-auto flex items-center justify-center">
                                    <Icon name="close" className="w-12 h-12 text-red-500" />
                                </div>
                                <h2 className="text-xl font-semibold text-red-500 mt-4">ACESSO NEGADO</h2>
                                <p className="text-gray-700 dark:text-gray-200 mt-2">{errorMessage}</p>
                            </>
                        )}
                         <button 
                            onClick={resetScanner}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-xl transition-colors mt-6"
                        >
                            Escanear Próximo
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes pulse-red { 
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7), 0 0 0 9999px rgba(0,0,0,0.7); }
                    50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0), 0 0 0 9999px rgba(0,0,0,0.7); }
                }
                .animate-pulse-red { animation: pulse-red 1.5s infinite; }
                
                @keyframes scan-line-anim {
                    0% { top: -10%; }
                    100% { top: 100%; }
                }
                .animate-scan-line {
                    animation: scan-line-anim 2.5s linear infinite;
                }

                #qr-reader video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            `}</style>
        </div>
    );
};

export default CredentialScannerScreen;