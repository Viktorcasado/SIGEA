import React from 'react';
import { Certificate } from '../types';
import Icon from './Icon';

interface CertificateCardProps {
    certificate: Certificate;
    onView: () => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, onView }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm dark:shadow-none">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <Icon name="star" className="w-6 h-6 text-ifal-green" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{certificate.eventTitle}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{certificate.eventDate}</p>
                </div>
            </div>
            <button
                onClick={onView}
                className="bg-ifal-green/10 text-ifal-green text-sm font-semibold px-4 py-2 rounded-xl hover:bg-ifal-green/20 transition-colors"
            >
                Visualizar
            </button>
        </div>
    );
};

export default CertificateCard;