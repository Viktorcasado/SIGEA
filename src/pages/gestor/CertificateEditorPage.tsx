"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/src/integrations/supabase/client';
import { CertificateTemplateRepository } from '@/src/repositories/CertificateTemplateRepository';
import { CertificateTemplate, CertificateMapping } from '@/src/types';
import { ArrowLeft, Save, Type, QrCode, Trash2, Loader2, Move, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';

const AVAILABLE_FIELDS = [
  { id: 'participant_name', label: 'Nome do Participante', icon: Type },
  { id: 'cpf', label: 'CPF', icon: Type },
  { id: 'event_title', label: 'Título do Evento', icon: Type },
  { id: 'workload_hours', label: 'Carga Horária', icon: Type },
  { id: 'issue_date', label: 'Data de Emissão', icon: Type },
  { id: 'certificate_code', label: 'Código SIGEA', icon: Type },
  { id: 'qr_code', label: 'QR Code de Validação', icon: QrCode },
];

export default function CertificateEditorPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [mapping, setMapping] = useState<CertificateMapping>({ fields: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      CertificateTemplateRepository.getByEvent(eventId).then(data => {
        if (data) {
          setTemplate(data);
          setMapping(data.mapping || { fields: {} });
          
          const { data: { publicUrl } } = supabase.storage
            .from('certificate-templates')
            .getPublicUrl(data.template_file_path);
          setTemplateUrl(publicUrl);
        }
        setLoading(false);
      });
    }
  }, [eventId]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !selectedField) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMapping(prev => ({
      fields: {
        ...prev.fields,
        [selectedField]: {
          x,
          y,
          fontSize: prev.fields[selectedField]?.fontSize || 14,
          size: selectedField === 'qr_code' ? 80 : undefined
        }
      }
    }));
    setSelectedField(null);
  };

  const removeField = (fieldId: string) => {
    const newFields = { ...mapping.fields };
    delete newFields[fieldId];
    setMapping({ fields: newFields });
  };

  const handleSave = async () => {
    if (!eventId) return;
    setSaving(true);
    try {
      await CertificateTemplateRepository.updateMapping(eventId, mapping);
      alert('Mapeamento salvo com sucesso!');
      navigate(`/gestor/eventos/${eventId}/certificado-template`);
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  if (!template) return <div className="text-center py-20">Template não encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link to={`/gestor/eventos/${eventId}/certificado-template`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="font-black text-gray-900">Editor de Certificado</h1>
            <p className="text-xs text-gray-500">Posicione os campos sobre o modelo</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-indigo-300"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Mapeamento
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar de Campos */}
        <aside className="w-full lg:w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Campos Disponíveis</h2>
          <div className="space-y-2">
            {AVAILABLE_FIELDS.map(field => {
              const isPlaced = !!mapping.fields[field.id];
              return (
                <button
                  key={field.id}
                  onClick={() => setSelectedField(field.id)}
                  disabled={isPlaced}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    selectedField === field.id 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : isPlaced 
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-600 opacity-60 cursor-default'
                        : 'border-gray-50 bg-gray-50 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <field.icon className="w-4 h-4" />
                    <span className="text-sm font-bold">{field.label}</span>
                  </div>
                  {isPlaced && <CheckCircle className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          {selectedField && (
            <div className="mt-6 p-4 bg-indigo-600 text-white rounded-2xl text-sm font-medium animate-pulse">
              Clique no local desejado no certificado para posicionar o campo.
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Dicas</h3>
            <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
              <li>Use um arquivo A4 (297x210mm) para melhor resultado.</li>
              <li>O QR Code é essencial para a validação pública.</li>
              <li>Você pode remover campos clicando no ícone de lixeira no preview.</li>
            </ul>
          </div>
        </aside>

        {/* Área do Canvas */}
        <main className="flex-1 p-4 lg:p-10 overflow-auto flex justify-center items-start bg-gray-200">
          <div 
            ref={containerRef}
            onClick={handleCanvasClick}
            className={`relative bg-white shadow-2xl transition-all ${selectedField ? 'cursor-crosshair' : 'cursor-default'}`}
            style={{ 
              width: '100%', 
              maxWidth: '842px', // A4 Landscape ratio
              aspectRatio: '297 / 210',
              backgroundImage: templateUrl ? `url(${templateUrl})` : 'none',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          >
            {/* Renderização dos campos mapeados */}
            {Object.entries(mapping.fields).map(([id, pos]: [string, any]) => {
              const fieldInfo = AVAILABLE_FIELDS.find(f => f.id === id);
              return (
                <div
                  key={id}
                  className="absolute group"
                  style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="bg-indigo-600/90 text-white px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap flex items-center gap-2 shadow-lg">
                    <Move className="w-3 h-3" />
                    {fieldInfo?.label}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeField(id); }}
                      className="hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {id === 'qr_code' ? (
                    <div className="w-16 h-16 border-2 border-indigo-600 border-dashed bg-white/50 mt-1 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-indigo-600" />
                    </div>
                  ) : (
                    <div className="h-4 w-32 border-b-2 border-indigo-600 border-dashed mt-1" />
                  )}
                </div>
              );
            })}

            {/* Placeholder se for PDF e não tiver preview de imagem */}
            {template.template_type === 'pdf' && !templateUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">Preview de PDF não disponível no editor.</p>
                  <p className="text-xs text-gray-400">Recomendamos usar PNG/JPG para configurar o mapeamento.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}