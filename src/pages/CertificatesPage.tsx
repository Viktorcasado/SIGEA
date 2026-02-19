"use client";

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Download, Copy, Award } from 'lucide-react';
import { useUser } from '@/src/contexts/UserContext';
import { supabase } from '@/src/integrations/supabase/client';
import { Certificate } from '@/src/types';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { motion } from 'motion/react';

export default function CertificatesPage() {
  const { user } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('certificados')
        .select(`
          *,
          eventos (*)
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        const formatted: Certificate[] = data.map(c => ({
          id: c.id,
          userId: c.user_id,
          eventoId: c.evento_id,
          codigo: c.codigo_certificado,
          dataEmissao: new Date(c.emitido_em),
          event: {
            id: c.eventos.id,
            titulo: c.eventos.titulo,
            instituicao: 'IFAL',
            campus: c.eventos.campus,
            dataInicio: new Date(c.eventos.data_inicio),
            local: '',
            descricao: '',
            modalidade: 'Presencial',
            status: 'publicado'
          }
        }));
        setCertificates(formatted);
      }
      setLoading(false);
    };

    fetchCertificates();
  }, [user]);

  const generatePdf = async (cert: Certificate) => {
    if (!cert.event) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    const validationUrl = `${window.location.origin}/validar-certificado?codigo=${cert.codigo}`;

    // Fundo e Bordas
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setDrawColor(79, 70, 229); // Indigo-600
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 273, 186);
    
    // Cabeçalho
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('SISTEMA INTEGRADO DE GESTÃO DE EVENTOS ACADÊMICOS - SIGEA', 148.5, 30, { align: 'center' });

    // Título Principal
    doc.setFontSize(48);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO', 148.5, 65, { align: 'center' });

    // Texto de Certificação
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text('Certificamos para os devidos fins que', 148.5, 90, { align: 'center' });
    
    // Nome do Usuário
    doc.setFontSize(32);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.nome || 'Participante', 148.5, 110, { align: 'center' });

    // Detalhes do Evento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`participou com êxito do evento "${cert.event.titulo}"`, 148.5, 130, { align: 'center' });
    doc.text(`realizado em ${cert.event.dataInicio.toLocaleDateString('pt-BR')} no campus ${cert.event.campus}.`, 148.5, 140, { align: 'center' });

    // QR Code e Validação
    const qrCodeDataUrl = await QRCode.toDataURL(validationUrl);
    doc.addImage(qrCodeDataUrl, 'PNG', 20, 155, 35, 35);
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Para validar este documento, aponte a câmera para o QR Code', 60, 170);
    doc.text(`ou acesse o portal de validação com o código: ${cert.codigo}`, 60, 175);

    // Assinatura Simbólica
    doc.setDrawColor(200, 200, 200);
    doc.line(180, 175, 260, 175);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Coordenação de Eventos', 220, 182, { align: 'center' });
    doc.text('SIGEA - Plataforma Unificada', 220, 187, { align: 'center' });

    doc.save(`certificado-${cert.codigo}.pdf`);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-gray-900">Certificados</h1>
        <p className="text-gray-500 mt-1">Seus documentos de participação acadêmica</p>
      </header>

      <Link to="/validar-certificado" className="flex items-center justify-center gap-3 w-full bg-indigo-600 text-white font-bold px-6 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
        <BadgeCheck className="w-6 h-6" />
        Validar um certificado
      </Link>

      <main className="space-y-4">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />)
        ) : certificates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Award className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Nenhum certificado ainda</h3>
            <p className="text-gray-500 mt-2">Participe de eventos para receber seus certificados aqui.</p>
          </div>
        ) : (
          certificates.map((cert, index) => (
            <motion.div 
              key={cert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4"
            >
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{cert.event?.titulo}</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">{cert.codigo}</p>
                <p className="text-xs text-gray-400 mt-2">Emitido em {cert.dataEmissao.toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => generatePdf(cert)}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                  title="Baixar PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { navigator.clipboard.writeText(cert.codigo); alert('Código copiado!'); }}
                  className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Copiar Código"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}