import React from 'react';
import { Certificate, User } from '../types';
import QrCodeGenerator from './QrCodeGenerator';

interface CertificateWidgetProps {
    certificate: Certificate;
    user: User | null;
}

const CertificateWidget: React.FC<CertificateWidgetProps> = ({ certificate, user }) => {
    const qrUrl = `https://sigea-ifal.web.app/validate?code=${certificate.code}`;
    const userIdentifier = user?.user_type === 'servidor' 
        ? `SIAPE: ${user.registration_number}` 
        : `Matrícula: ${user?.registration_number}`;

    return (
        <div className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
            <header className="text-center border-b-2 border-gray-200 dark:border-gray-700 pb-3 mb-3">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white">Instituto Federal de Alagoas</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pró-Reitoria de Extensão - PROEX</p>
            </header>

            <main className="my-4">
                <h1 className="text-2xl font-semibold text-ifal-green tracking-tight">CERTIFICADO</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Certificamos que <strong className="text-gray-900 dark:text-white font-semibold">{user?.full_name}</strong>,
                    portador(a) do documento de identificação <strong className="text-gray-900 dark:text-white font-semibold">{userIdentifier}</strong>,
                    participou do evento:
                </p>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-3">{certificate.eventTitle}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{certificate.eventDate}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">com carga horária de {certificate.event.hours} horas.</p>
            </main>

            <footer className="mt-4 pt-4 border-t border-dashed border-gray-300 dark:border-gray-600">
                <div className="bg-white p-2 rounded-xl inline-block">
                    <QrCodeGenerator 
                        url={qrUrl} 
                        size={120}
                        dotsColorOverride="#000000"
                        backgroundColorOverride="#FFFFFF"
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Valide este certificado usando o QR Code ou o código abaixo:</p>
                <p className="font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-xl text-ifal-green mt-2 tracking-widest text-sm inline-block">{certificate.code}</p>
            </footer>
        </div>
    );
};

export default CertificateWidget;