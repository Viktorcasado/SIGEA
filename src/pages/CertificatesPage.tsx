import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Download, Copy, Loader2, Award, ArrowRight, Search, FileCheck, Calendar, Clock } from 'lucide-react';
import { useUser } from '@/src/contexts/UserContext';
import { CertificateRepository } from '@/src/repositories/CertificateRepository';
import { Certificate, Event } from '@/src/types';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { motion } from 'motion/react';

const generatePdf = async (certificate: Certificate, event?: Event) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const validationUrl = `${window.location.origin}/validar-certificado?codigo=${certificate.codigo_validacao}`;

    // Borda decorativa
    doc.setDrawColor(79, 70, 229); // Indigo-600
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 277, 190);
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 273, 186);
    
    // Título
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.text('CERTIFICADO', 148.5, 50, { align: 'center' });

    // Texto de certificação
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text('Certificamos que o participante concluiu com êxito o evento:', 148.5, 70, { align: 'center' });

    // Nome do Evento
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text(certificate.evento_titulo, 148.5, 90, { align: 'center' });

    // Detalhes
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81); // Gray-700
    const campusInfo = event ? `Realizado no ${event.campus || 'Campus Institucional'}` : '';
    doc.text(campusInfo, 148.5, 105, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Carga Horária Total: ${Math.floor(certificate.carga_horaria_minutos / 60)} horas`, 148.5, 125, { align: 'center' });
    doc.text(`Data de Emissão: ${new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}`, 148.5, 135, { align: 'center' });

    // Rodapé e Validação
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175); // Gray-400
    doc.text(`Código de Autenticidade: ${certificate.codigo_validacao}`, 148.5, 170, { align: 'center' });

    try {
        const qrCodeDataUrl = await QRCode.toDataURL(validationUrl);
        doc.addImage(qrCodeDataUrl, 'PNG', 138.5, 175, 20, 20);
    } catch (err) {
        console.error('Failed to generate QR code', err);
    }

    doc.save(`Certificado-${certificate.evento_titulo.replace(/\s+/g, '-')}.pdf`);
};

const CertificateCard = ({ certificate }: { certificate: Certificate }) => {
  const [isCopying, setIsCopying] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(certificate.codigo_validacao);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
    >
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Award className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
                <h3 className="font-black text-gray-900 text-xl tracking-tight leading-tight">{certificate.evento_titulo}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                        Emitido em {new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center text-xs font-bold text-indigo-500 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {Math.floor(certificate.carga_horaria_minutos / 60)} Horas
                    </div>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 group/code">
                <code className="text-[11px] font-black font-mono text-gray-500 uppercase tracking-widest">
                    {certificate.codigo_validacao}
                </code>
                <button 
                    onClick={copyToClipboard} 
                    className="ml-3 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Copiar código"
                >
                    {isCopying ? <FileCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
            <button 
                onClick={() => generatePdf(certificate, certificate.evento)} 
                className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
                <Download className="w-5 h-5" />
                Baixar PDF
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CertificatesPage() {
  const { user } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      CertificateRepository.listByUser(user.id)
        .then(setCertificates)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Meus Certificados</h1>
            <p className="text-gray-500 font-bold mt-1">Sua coleção de conquistas acadêmicas e profissionais.</p>
        </div>
        <Link 
            to="/validar-certificado" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
        >
            <BadgeCheck className="w-4 h-4 text-indigo-600" />
            Validar Externo
        </Link>
      </header>

      <main className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-600" />
            <p className="font-black uppercase tracking-widest text-xs">Carregando conquistas...</p>
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {certificates.map(cert => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm"
          >
            <div className="w-28 h-28 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
              <Award className="w-14 h-14 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Nenhum certificado ainda</h3>
            <p className="text-gray-500 font-bold mt-2 max-w-xs mx-auto">
              Participe de eventos, confirme sua presença e suas conquistas aparecerão aqui automaticamente.
            </p>
            <Link to="/explorar" className="mt-10 inline-flex items-center gap-3 bg-indigo-600 text-white font-black px-10 py-5 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              Explorar Eventos <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </main>

      {certificates.length > 0 && (
        <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-200">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Search className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h4 className="font-black text-xl tracking-tight">Precisa validar um código?</h4>
                    <p className="text-indigo-200 font-bold text-sm">Verifique a autenticidade de qualquer certificado SIGEA.</p>
                </div>
            </div>
            <Link 
                to="/validar-certificado" 
                className="w-full md:w-auto px-8 py-4 bg-white text-indigo-900 font-black rounded-2xl hover:bg-indigo-50 transition-all text-center"
            >
                Ir para Validação
            </Link>
        </div>
      )}
    </div>
  );
}