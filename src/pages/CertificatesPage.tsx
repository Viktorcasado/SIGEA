"use client";

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Download, Copy, Award, Search, Loader2, Clock, Calendar, ExternalLink } from 'lucide-react';
import { useUser } from '@/src/contexts/UserContext';
import { supabase } from '@/src/integrations/supabase/client';
import { Certificate } from '@/src/types';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';

export default function CertificatesPage() {
  const { user, loading: userLoading } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCertificates = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificados')
        .select(`
          *,
          events:evento_id (*)
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        const formatted: Certificate[] = data.map(c => {
          const eventData = Array.isArray(c.events) ? c.events[0] : c.events;
          
          return {
            id: c.id,
            userId: c.user_id,
            eventoId: c.evento_id,
            codigo: c.codigo_certificado,
            dataEmissao: new Date(c.emitido_em),
            carga_horaria: c.carga_horaria || eventData?.workload || 0,
            event: eventData ? {
              id: eventData.id,
              titulo: eventData.title,
              instituicao: 'IFAL',
              campus: eventData.campus,
              dataInicio: new Date(eventData.date),
              local: eventData.location || '',
              descricao: eventData.description || '',
              modalidade: 'Presencial',
              status: 'publicado',
              carga_horaria: eventData.workload || 0
            } : undefined
          };
        });
        setCertificates(formatted);
      }
    } catch (err) {
      console.error("Erro ao buscar certificados:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Depende apenas do ID do usuário

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        fetchCertificates();
      } else {
        setLoading(false);
      }
    }
  }, [user?.id, userLoading, fetchCertificates]);

  const filteredCertificates = certificates.filter(cert => 
    cert.event?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePdf = async (cert: Certificate) => {
    if (!cert.event) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    const validationUrl = `${window.location.origin}/#/validar-certificado?codigo=${cert.codigo}`;

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('SISTEMA INTEGRADO DE GESTÃO DE EVENTOS ACADÊMICOS - SIGEA', 148.5, 30, { align: 'center' });

    doc.setFontSize(48);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO', 148.5, 65, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text('Certificamos para os devidos fins que', 148.5, 90, { align: 'center' });
    
    doc.setFontSize(32);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.nome || 'Participante', 148.5, 110, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`participou com êxito do evento "${cert.event.titulo}"`, 148.5, 130, { align: 'center' });
    doc.text(`realizado em ${cert.event.dataInicio.toLocaleDateString('pt-BR')} no campus ${cert.event.campus}`, 148.5, 140, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.text(`com carga horária total de ${cert.carga_horaria} horas.`, 148.5, 150, { align: 'center' });

    const qrCodeDataUrl = await QRCode.toDataURL(validationUrl);
    doc.addImage(qrCodeDataUrl, 'PNG', 20, 155, 35, 35);
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Código de Validação: ${cert.codigo}`, 60, 175);

    doc.save(`certificado-${cert.codigo}.pdf`);
  };

  if (loading || userLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="font-bold text-gray-500">Carregando suas conquistas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Certificados</h1>
          <p className="text-gray-500 mt-1 font-medium">Gerencie e valide seus documentos acadêmicos.</p>
        </div>
        <Link to="/validar-certificado" className="flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <BadgeCheck className="w-6 h-6" />
          Validar Certificado
        </Link>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Filtrar por nome do evento ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-gray-900 font-medium"
        />
      </div>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCertificates.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-indigo-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-800">Nenhum certificado</h3>
              <p className="text-gray-500 mt-2 max-w-xs mx-auto font-medium">Participe de eventos para começar a colecionar seus certificados aqui.</p>
              <Link to="/explorar" className="mt-8 inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
                Explorar Eventos
              </Link>
            </motion.div>
          ) : (
            filteredCertificates.map((cert, index) => (
              <motion.div 
                key={cert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => generatePdf(cert)}
                      className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                      title="Baixar PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <Link 
                      to={`/validar-certificado?codigo=${cert.codigo}`}
                      className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                      title="Verificar Autenticidade"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                <h3 className="font-black text-gray-900 text-xl mb-2 leading-tight">{cert.event?.titulo}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Calendar className="w-4 h-4" />
                    Emitido em {cert.dataEmissao.toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Clock className="w-4 h-4" />
                    Carga horária: {cert.carga_horaria} horas
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Código SIGEA</span>
                    <span className="text-sm font-mono font-bold text-indigo-600">{cert.codigo}</span>
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(cert.codigo); alert('Código copiado!'); }}
                    className="text-xs font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}