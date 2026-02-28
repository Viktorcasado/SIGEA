"use client";

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { CertificateRepository } from '@/src/repositories/CertificateRepository';
import { Certificate, Event } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';

interface ValidationResult {
  certificate: Certificate;
  event: Event;
}

export default function ValidateCertificatePage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('codigo') || '');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    if (searchParams.get('codigo')) {
      handleValidation();
    }
  }, []);

  const handleValidation = async () => {
    if (!code.trim()) return;

    setValidationStatus('loading');
    setResult(null);

    try {
      const data = await CertificateRepository.validate(code.trim());
      if (data) {
        setResult(data);
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
      }
    } catch (error) {
      console.error(error);
      setValidationStatus('invalid');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 font-bold mb-8 group transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Início
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Validação de Certificado</h1>
          <p className="text-gray-500 font-medium mb-8">Insira o código para verificar a autenticidade.</p>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: SIGEA-0001-26"
                className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                onKeyDown={(e) => e.key === 'Enter' && handleValidation()}
              />
            </div>
            
            <button 
              onClick={handleValidation}
              disabled={validationStatus === 'loading' || !code.trim()}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none"
            >
              {validationStatus === 'loading' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  Validar
                </>
              )}
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {validationStatus === 'valid' && result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 bg-white p-8 rounded-[2.5rem] border-2 border-green-100 shadow-lg shadow-green-500/5"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Certificado Válido</h2>
                  <p className="text-sm font-bold text-green-600 uppercase tracking-widest">Autenticidade Confirmada</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Evento</p>
                  <p className="font-bold text-gray-900 text-lg leading-tight">{result.event.titulo}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Carga Horária</p>
                    <p className="font-bold text-gray-700">{Math.floor(result.certificate.carga_horaria_minutos / 60)} Horas</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Emissão</p>
                    <p className="font-bold text-gray-700">{new Date(result.certificate.data_emissao).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Instituição / Campus</p>
                  <p className="font-bold text-gray-700">{result.event.instituicao} — {result.event.campus}</p>
                </div>
              </div>
            </motion.div>
          )}

          {validationStatus === 'invalid' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 bg-white p-8 rounded-[2.5rem] border-2 border-red-100 shadow-lg shadow-red-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Não Encontrado</h2>
                  <p className="text-sm font-bold text-red-600 uppercase tracking-widest">Código Inválido</p>
                </div>
              </div>
              <p className="mt-4 text-gray-500 font-medium leading-relaxed">
                O código inserido não corresponde a nenhum certificado em nosso sistema. Verifique se há erros de digitação e tente novamente.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}