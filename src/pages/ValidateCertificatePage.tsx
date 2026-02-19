import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { mockCertificates } from '@/src/data/mock';
import { mockEvents } from '@/src/data/mock';
import { Certificate, Event } from '@/src/types';

interface ValidationResult {
  certificate: Certificate;
  event: Event;
}

export default function ValidateCertificatePage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('codigo') || '');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidation = () => {
    const certificate = mockCertificates.find(c => c.codigo.toUpperCase() === code.toUpperCase());
    if (certificate) {
      const event = mockEvents.find(e => e.id === certificate.eventId);
      if (event) {
        setResult({ certificate, event });
        setValidationStatus('valid');
        return;
      }
    }
    setResult(null);
    setValidationStatus('invalid');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao Início
        </Link>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900">Validação de Certificado</h1>
            <p className="text-gray-500 mt-1">Insira o código para verificar a autenticidade.</p>

            <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <input 
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SIGEA-XXXX-YY"
                    className="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <button 
                    onClick={handleValidation}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Search className="w-5 h-5" />
                    Validar
                </button>
            </div>
             <button className="w-full mt-2 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors">
                <QrCode className="w-5 h-5" />
                Ler QR Code (em breve)
            </button>
        </div>

        {validationStatus === 'valid' && result && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <h2 className="text-lg font-bold text-green-800">Certificado Válido</h2>
                </div>
                <div className="mt-4 pl-9 text-gray-700 space-y-2">
                    <p><strong>Evento:</strong> {result.event.titulo}</p>
                    <p><strong>Instituição:</strong> {result.event.instituicao} - {result.event.campus}</p>
                    <p><strong>Carga Horária:</strong> {result.certificate.cargaHoraria}h</p>
                    <p><strong>Data de Emissão:</strong> {result.certificate.dataEmissao.toLocaleDateString('pt-BR')}</p>
                    <p><strong>Código:</strong> {result.certificate.codigo}</p>
                </div>
            </div>
        )}

        {validationStatus === 'invalid' && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-center">
                    <XCircle className="w-6 h-6 text-red-600 mr-3" />
                    <h2 className="text-lg font-bold text-red-800">Certificado Não Encontrado</h2>
                </div>
                <p className="mt-2 pl-9 text-red-700">O código inserido não corresponde a nenhum certificado em nosso sistema. Verifique o código e tente novamente.</p>
            </div>
        )}
    </div>
  );
}
