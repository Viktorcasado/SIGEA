
import React, { useState, useRef, useEffect } from 'react';
import { Event } from '../types';
import { supabase } from '../services/supabaseClient';
import Icon from './Icon';

interface CertificateTemplateEditorProps {
  event: Event;
}

const CertificateTemplateEditor: React.FC<CertificateTemplateEditorProps> = ({ event }) => {
  const [posX, setPosX] = useState(event.cert_pos_x || 50);
  const [posY, setPosY] = useState(event.cert_pos_y || 50);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));

    setPosX(x);
    setPosY(y);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const { error } = await supabase
            .from('events')
            .update({ 
                cert_pos_x: posX, 
                cert_pos_y: posY 
            })
            .eq('id', event.id);

        if (error) throw error;
        
        if (navigator.vibrate) navigator.vibrate(50);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
        console.error("Erro ao salvar modelo:", e);
        alert("Erro ao salvar no banco de dados. Verifique o console.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        ref={containerRef}
        className="relative aspect-[1.414/1] w-full bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-black/5 shadow-inner cursor-crosshair touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
      >
        {event.imageUrl ? (
            <img 
                src={event.imageUrl} 
                className="w-full h-full object-contain opacity-50 grayscale-[0.5]" 
                alt="Fundo do Certificado" 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Icon name="swatch" className="w-20 h-20 opacity-10" />
            </div>
        )}

        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-ifal-green/10 pointer-events-none" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-ifal-green/10 pointer-events-none" />

        <div 
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsDragging(true);
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg border-2 transition-all cursor-move z-10 ${
            isDragging 
                ? 'bg-blue-500/20 border-blue-500 shadow-2xl scale-110' 
                : 'bg-white/80 dark:bg-black/80 border-ifal-green shadow-lg animate-pulse-subtle'
          }`}
          style={{ left: `${posX}%`, top: `${posY}%` }}
        >
            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest whitespace-nowrap">
                [ NOME DO PARTICIPANTE ]
            </span>
            
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-1.5 py-0.5 rounded font-mono">
                X:{posX.toFixed(1)}% Y:{posY.toFixed(1)}%
            </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-black/5">
        <div className="flex items-center space-x-6">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alinhamento X</span>
                <input 
                    type="range" min="0" max="100" step="0.5" value={posX} 
                    onChange={e => setPosX(parseFloat(e.target.value))}
                    className="accent-ifal-green h-1 mt-2"
                />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alinhamento Y</span>
                <input 
                    type="range" min="0" max="100" step="0.5" value={posY} 
                    onChange={e => setPosY(parseFloat(e.target.value))}
                    className="accent-ifal-green h-1 mt-2"
                />
            </div>
        </div>

        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-ifal-green text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-ifal-green/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
        >
            {isSaving ? 'Salvando...' : 'Salvar Modelo'}
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-ifal-green text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl animate-fade-in z-50">
            Modelo de Certificado Atualizado!
        </div>
      )}

      <style>{`
        .animate-pulse-subtle { animation: pulseSubtle 2s infinite ease-in-out; }
        @keyframes pulseSubtle { 0%, 100% { opacity: 1; border-color: #00913F; } 50% { opacity: 0.8; border-color: #00D15F; } }
      `}</style>
    </div>
  );
};

export default CertificateTemplateEditor;
