import React, { useEffect, useState } from 'react';
import Icon from './Icon';

declare global {
    interface Window {
        Html5QrcodeScanner: any;
        Html5Qrcode: any;
        Html5QrcodeSupportedFormats: any;
    }
}

interface QrScannerProps {
    onScanSuccess: (decodedText: string, decodedResult: any) => void;
    onScanFailure: (error: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onScanFailure }) => {
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        let qrCodeScanner: any = null;

        const startScanner = async () => {
            if (!window.Html5Qrcode) {
                setInitError("Biblioteca do scanner não carregada.");
                return;
            }
            
            qrCodeScanner = new window.Html5Qrcode("qr-reader");
            
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                formatsToSupport: [ window.Html5QrcodeSupportedFormats.QR_CODE ]
            };

            try {
                await qrCodeScanner.start(
                    { facingMode: "environment" },
                    config,
                    onScanSuccess,
                    onScanFailure
                );
            } catch (err: any) {
                console.error("Falha ao iniciar o scanner QR:", err);
                setInitError("Não foi possível acessar a câmera. Verifique as permissões no seu navegador.");
            }
        };

        startScanner();
        
        return () => {
            if (qrCodeScanner && qrCodeScanner.isScanning) {
                qrCodeScanner.stop().catch((err: any) => {
                    console.warn("Não foi possível parar o scanner de forma limpa.", err);
                });
            }
        };
    }, [onScanSuccess, onScanFailure]);

    if (initError) {
        return (
            <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center text-center text-white p-4">
                <Icon name="camera" className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="font-semibold">Erro na Câmera</h3>
                <p className="text-sm text-gray-300">{initError}</p>
            </div>
        );
    }

    return <div id="qr-reader" className="w-full h-full rounded-lg overflow-hidden"></div>;
};

export default QrScanner;