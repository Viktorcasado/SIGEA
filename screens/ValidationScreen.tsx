import React, { useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import QrScanner from '../components/QrScanner';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';

interface ValidationScreenProps {
  onBack: () => void;
}

type ValidationStatus = 'scanning' | 'loading' | 'valid' | 'invalid' | 'error';

interface ValidatedCertificate {
    event_title: string;
    profiles: {
        full_name: string;
    };
}

const ValidationScreen: React.FC<ValidationScreenProps> = ({ onBack }) => {
  const [status, setStatus] = useState<ValidationStatus>('scanning');
  const [certificateData, setCertificateData] = useState<ValidatedCertificate | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    setStatus('loading');

    // Extract code from URL if it's a full URL
    let validationCode = decodedText;
    try {
        if (decodedText.includes('validate?code=')) {
            const url = new URL(decodedText);
            validationCode = url.searchParams.get('code') || decodedText;
        }
    } catch (e) {
        // Not a valid URL, proceed with decodedText
    }
    
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('event_title, profiles(full_name)')
        .eq('code', validationCode)
        .single();
      
      if (error || !data) {
        setStatus('invalid');
      } else {
        setCertificateData(data as ValidatedCertificate);
        setStatus('valid');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  }, []);
    
  const handleScanFailure = useCallback((error: string) => {
    console.warn(`QR scan error: ${error}`);
    // This is often a non-critical error (e.g., camera not ready), so we don't show a modal for it.
  }, []);

  const resetScanner = () => {
    setStatus('scanning');
    setCertificateData(null);
    setErrorMessage('');
  };

  const isModalOpen = status !== 'scanning';
  const showScanner = status === 'scanning';

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Validar Certificado" onBack={onBack} />
      
      <main className="flex-grow relative bg-gray-900">
        {/* Camera and Overlay Section */}
        <div className={`w-full h-full ${showScanner ? 'opacity-100' : 'opacity-0'}`}>
            <QrScanner 
                onScanSuccess={handleScanSuccess} 
                onScanFailure={handleScanFailure} 
            />
        </div>

        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8">
            <div className="w-full max-w-xs aspect-square border-4 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
            <p className="text-white text-center font-semibold mt-6 text-lg">Posicione o QR Code na área</p>
        </div>

        {/* Feedback Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 text-center animate-scale-up">
                    {status === 'loading' && (
                        <>
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ifal-green mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-300 font-semibold">Validando Certificado...</p>
                        </>
                    )}
                    {status === 'valid' && certificateData && (
                        <>
                            <div className="w-20 h-20 bg-ifal-green/10 rounded-full mx-auto flex items-center justify-center">
                                <Icon name="shield" className="w-12 h-12 text-ifal-green" />
                            </div>
                            <h2 className="text-xl font-semibold text-ifal-green mt-4">AUTÊNTICO</h2>
                            <p className="text-gray-700 dark:text-gray-200 mt-2">Certificado emitido para:</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{certificateData.profiles.full_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Referente ao evento "{certificateData.event_title}"</p>
                        </>
                    )}
                     {(status === 'invalid' || status === 'error') && (
                        <>
                            <div className="w-20 h-20 bg-red-500/10 rounded-full mx-auto flex items-center justify-center">
                                <Icon name="close" className="w-12 h-12 text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-red-500 mt-4">INVÁLIDO</h2>
                             <p className="text-gray-700 dark:text-gray-200 mt-2">
                               {status === 'error' ? 'Ocorreu um erro na validação.' : 'Certificado não encontrado ou inválido.'}
                             </p>
                             {errorMessage && <p className="text-xs text-red-400 mt-1">{errorMessage}</p>}
                        </>
                    )}
                     <button 
                        onClick={resetScanner}
                        className="w-full bg-ifal-green text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors mt-6"
                    >
                        Escanear Novamente
                    </button>
                </div>
                 <style>{`
                    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                    .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                `}</style>
            </div>
        )}
      </main>
    </div>
  );
};

export default ValidationScreen;