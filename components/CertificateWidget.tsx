
import React from 'react';
import { Certificate, User } from '../types';
import Logo from './Logo';

interface CertificateWidgetProps {
    certificate: Certificate;
    user: User | null;
}

const CertificateWidget: React.FC<CertificateWidgetProps> = ({ certificate, user }) => {
    return (
        <div className="w-full bg-white border-[10px] border-ifal-green rounded-lg p-6 sm:p-10 flex flex-col items-center text-black aspect-[800/600] shadow-2xl">
            <Logo className="h-16 w-auto" />
            
            <h1 className="text-3xl sm:text-4xl font-bold text-ifal-green mt-6 mb-8 tracking-tight">
                CERTIFICADO
            </h1>
            
            <p className="text-center text-gray-800 text-base sm:text-lg leading-relaxed max-w-md">
                Certificamos que <strong className="font-bold text-xl sm:text-2xl text-black">{user?.full_name}</strong> participou da atividade <strong className="font-semibold">{certificate.eventTitle}</strong> com carga horária de {certificate.event.hours} horas.
            </p>
            
            <div className="flex-grow" />
            
            <div className="text-center">
                <p className="text-xs text-gray-500">
                    Autenticidade verificável em: sigea.ifal.events
                </p>
                <p className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-ifal-green mt-2 tracking-widest text-sm">
                    {certificate.code}
                </p>
            </div>
        </div>
    );
};

export default CertificateWidget;