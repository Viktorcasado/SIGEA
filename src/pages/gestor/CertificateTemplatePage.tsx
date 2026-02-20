"use client";

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/src/integrations/supabase/client';
import { CertificateTemplateRepository } from '@/src/repositories/CertificateTemplateRepository';
import { CertificateTemplate } from '@/src/types';
import { ArrowLeft, Upload, FileText, Image as ImageIcon, CheckCircle, Settings, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function CertificateTemplatePage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (eventId) {
      CertificateTemplateRepository.getByEvent(eventId)
        .then(setTemplate)
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const type = fileExt === 'pdf' ? 'pdf' : 'image';
      const filePath = `templates/${eventId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('certificate-templates')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      await CertificateTemplateRepository.saveTemplate(eventId, filePath, type);
      
      const updated = await CertificateTemplateRepository.getByEvent(eventId);
      setTemplate(updated);
      alert('Modelo carregado com sucesso!');
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to={`/evento/${eventId}`} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar ao Evento
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Modelo de Certificado</h1>
          <p className="text-gray-500 mt-1">Configure o design que será usado para os participantes.</p>
        </header>

        {!template ? (
          <div className="border-4 border-dashed border-gray-100 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhum modelo ativo</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Suba um arquivo PDF ou Imagem (A4) para começar a configurar seu certificado.</p>
            
            <label className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-100">
              <Upload className="w-5 h-5" />
              {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-2 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-emerald-900">Modelo Ativo</p>
                  <p className="text-sm text-emerald-700 flex items-center gap-1">
                    {template.template_type === 'pdf' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    Arquivo {template.template_type.toUpperCase()} configurado
                  </p>
                </div>
              </div>
              <label className="text-sm font-bold text-emerald-600 hover:underline cursor-pointer">
                Substituir
                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to={`/gestor/eventos/${eventId}/certificado-template/editor`}
                className="flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-100 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
              >
                <Settings className="w-10 h-10 text-gray-400 group-hover:text-indigo-600 mb-4" />
                <span className="font-bold text-gray-700 group-hover:text-indigo-900">Editar Mapeamento</span>
                <span className="text-xs text-gray-400 mt-1">Posicionar campos no PDF</span>
              </Link>

              <button 
                className="flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-100 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
                onClick={() => alert('Funcionalidade de teste em breve!')}
              >
                <FileText className="w-10 h-10 text-gray-400 group-hover:text-indigo-600 mb-4" />
                <span className="font-bold text-gray-700 group-hover:text-indigo-900">Testar Preenchimento</span>
                <span className="text-xs text-gray-400 mt-1">Gerar preview com dados fake</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}