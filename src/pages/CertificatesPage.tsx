import { Link } from 'react-router-dom';
import { BadgeCheck, Download, Copy } from 'lucide-react';
import { mockCertificates } from '@/src/data/mock';
import { mockEvents, mockUser } from '@/src/data/mock';
import { Certificate, Event, User } from '@/src/types';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const generatePdf = async (certificate: Certificate, event: Event) => {
    const doc = new jsPDF();
    const validationUrl = `https://sigea.app/validar-certificado?codigo=${certificate.codigo}`;

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGEA - Certificado de Participação', 105, 20, { align: 'center' });

    // Body
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Certificamos que ${mockUser.nome} participou do evento:`, 105, 40, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(event.titulo, 105, 55, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Realizado por: ${event.instituicao} - ${event.campus}`, 105, 65, { align: 'center' });
    doc.text(`Carga Horária: ${certificate.cargaHoraria} horas`, 105, 75, { align: 'center' });
    doc.text(`Emitido em: ${certificate.dataEmissao.toLocaleDateString('pt-BR')}`, 105, 85, { align: 'center' });

    // Validation Code
    doc.setFont('courier', 'bold');
    doc.text(`Código de Validação: ${certificate.codigo}`, 105, 100, { align: 'center' });

    // QR Code
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(validationUrl);
        doc.addImage(qrCodeDataUrl, 'PNG', 85, 110, 40, 40);
    } catch (err) {
        console.error('Failed to generate QR code', err);
    }

    doc.save(`certificado-${certificate.codigo}.pdf`);
};

const CertificateCard = ({ certificate }: { certificate: Certificate }) => {
  const event = mockEvents.find(e => e.id === certificate.eventId);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(certificate.codigo);
    alert('Código copiado!');
  };

  if (!event) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{event.titulo}</h3>
          <p className="text-sm text-gray-500 mt-1">{event.instituicao} - {event.campus}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-3">
            <span>Carga Horária: <strong>{certificate.cargaHoraria}h</strong></span>
            <span>Emissão: <strong>{certificate.dataEmissao.toLocaleDateString('pt-BR')}</strong></span>
          </div>
          <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded-md inline-block mt-3">{certificate.codigo}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
            <div className="flex gap-2">
                <button onClick={() => generatePdf(certificate, event)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={copyToClipboard} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Copy className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Certificados</h1>
        <p className="text-gray-500 mt-1">Baixe e valide seus certificados digitais</p>
      </header>

      <Link to="/validar-certificado" className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
        <BadgeCheck className="w-5 h-5" />
        Validar um certificado
      </Link>

      <main className="space-y-4">
        {mockCertificates.map(cert => (
          <CertificateCard key={cert.id} certificate={cert} />
        ))}
      </main>
    </div>
  );
}
