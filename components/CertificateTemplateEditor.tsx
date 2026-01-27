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
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(event.cert_orientation || 'landscape');
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosX(Math.max(5, Math.min(95, x)));
    setPosY(Math.max(5, Math.min(95, y)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const { error } = await supabase
            .from('events')
            .update({ 
                cert_pos_x: posX, 
                cert_pos_y: posY,
                cert_orientation: orientation
            })
            .eq('id', event.id);

        if (error) throw error;
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
        console.error("Erro ao salvar modelo:", e);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 bg-gray-100 dark:bg-white/5 p-2 rounded-2xl w-fit">
        <button onClick={() => setOrientation('landscape')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orientation === 'landscape' ? 'bg-white dark:bg-gray-800 text-ifal-green shadow-sm' : 'text-gray-400'}`}>Paisagem</button>
        <button onClick={() => setOrientation('portrait')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orientation === 'portrait' ? 'bg-white dark:bg-gray-800 text-ifal-green shadow-sm' : 'text-gray-400'}`}>Retrato</button>
      </div>

      <div 
        ref={containerRef}
        className={`relative w-full max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-black/5 shadow-inner cursor-crosshair touch-none select-none transition-all duration-500 ${orientation === 'landscape' ? 'aspect-[1.414/1]' : 'aspect-[1/1.414] max-w-sm'}`}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
      >
        {event.imageUrl ? (
            <img src={event.imageUrl} className="w-full h-full object-contain opacity-40 grayscale" alt="Fundo" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><Icon name="swatch" className="w-20 h-20 opacity-10" /></div>
        )}

        <div 
          onPointerDown={(e) => { e.stopPropagation(); setIsDragging(true); }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg border-2 transition-all ${isDragging ? 'bg-blue-500/20 border-blue-500 scale-110' : 'bg-white/90 dark:bg-black/90 border-ifal-green shadow-xl'}`}
          style={{ left: `${posX}%`, top: `${posY}%` }}
        >
            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest whitespace-nowrap">
                [ NOME DO ALUNO ]
            </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 gap-4">
        <div className="flex space-x-4 w-full sm:w-auto">
            <div className="flex-1"><span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Eixo X</span><input type="range" min="0" max="100" step="0.5" value={posX} onChange={e => setPosX(parseFloat(e.target.value))} className="w-full accent-ifal-green" /></div>
            <div className="flex-1"><span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Eixo Y</span><input type="range" min="0" max="100" step="0.5" value={posY} onChange={e => setPosY(parseFloat(e.target.value))} className="w-full accent-ifal-green" /></div>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto bg-ifal-green text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50">
            {isSaving ? 'Salvando...' : 'Aplicar Design'}
        </button>
      </div>

      {showToast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ifal-green text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl animate-fade-in z-50">Design Salvo com Sucesso!</div>}
    </div>
  );
};

export default CertificateTemplateEditor;