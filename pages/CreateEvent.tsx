import React, { useState, useRef, useEffect } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';

interface CreateEventProps {
  navigateTo: (page: string, id?: string) => void;
  onAddEvent: (event: Event) => void;
  onUpdateEvent?: (event: Event) => void;
  eventToEdit?: Event;
}

const CreateEvent: React.FC<CreateEventProps> = ({ navigateTo, onAddEvent, onUpdateEvent, eventToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    date: '',
    time: '08:00 - 18:00',
    location: 'Auditório',
    type: 'Palestra' as any,
    imageUrl: 'https://picsum.photos/seed/default/800/400',
    certificateTemplateUrl: '',
    certificateTemplateName: '',
    certificateHours: 20
  });

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        description: eventToEdit.description,
        campus: eventToEdit.campus,
        date: eventToEdit.date,
        time: eventToEdit.time,
        location: eventToEdit.location,
        type: eventToEdit.type,
        imageUrl: eventToEdit.imageUrl,
        certificateTemplateUrl: eventToEdit.certificateTemplateUrl || '',
        certificateTemplateName: '',
        certificateHours: eventToEdit.certificateHours || 20
      });
    }
  }, [eventToEdit]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const certTemplateRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertTemplateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        certificateTemplateName: file.name,
        certificateTemplateUrl: 'blob_simulado' // Em produção seria a URL do storage
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validação Manual
    if (!formData.title || !formData.date || !formData.certificateHours || !formData.campus) {
      alert("Por favor, preencha todos os campos obrigatórios: Título, Campus, Carga Horária e Data.");
      setLoading(false);
      return;
    }

    const eventData: Event = {
      ...formData,
      id: eventToEdit ? eventToEdit.id : Math.random().toString(36).substr(2, 9),
      status: eventToEdit ? eventToEdit.status : 'Inscrições Abertas',
      price: eventToEdit ? eventToEdit.price : 'Gratuito',
      certificateHours: formData.certificateHours
    };

    // Remove campos que não existem no banco de dados para evitar erro
    // @ts-ignore
    delete eventData.certificateTemplateName;

    if (eventToEdit && onUpdateEvent) {
      await onUpdateEvent(eventData);
    } else {
      await onAddEvent(eventData);
      navigateTo('home');
      alert("Evento publicado com modelo de certificado!");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-36">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-gray-800 p-4 flex items-center justify-between">
        <button onClick={() => navigateTo(eventToEdit ? 'manage-event' : 'home', eventToEdit?.id)} className="size-11 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined font-black">close</span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">{eventToEdit ? 'Editar Evento' : 'Publicar Evento'}</h2>
        <div className="w-11"></div>
      </header>

      <main className="p-6 overflow-y-auto space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Banner */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Banner do Evento (Capa)</span>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden relative cursor-pointer group"
            >
              <img src={formData.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Preview" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Alterar Banner</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          {/* Dados Gerais */}
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Título do Evento *</span>
              <input required className="w-full p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm" placeholder="Ex: VI Semana de TI" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Campus *</span>
                <select required className="w-full p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm" value={formData.campus} onChange={e => setFormData({ ...formData, campus: e.target.value })}>
                  <option value="" disabled>Selecione</option>
                  {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2 w-32">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Carga Horária *</span>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm"
                    value={formData.certificateHours}
                    onChange={e => setFormData({ ...formData, certificateHours: parseInt(e.target.value) || 0 })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Horas</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Data *</span>
              <input required type="text" className="w-full p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm" placeholder="Ex: 25 de Outubro, 2024" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Horário</span>
              <input type="text" className="w-full p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm" placeholder="Ex: 08:00 - 18:00" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
            </div>
          </div>

          {/* Modelo de Certificado */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Modelo de Certificado (PDF ou Imagem)</span>
            <div
              onClick={() => certTemplateRef.current?.click()}
              className={`w-full p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${formData.certificateTemplateUrl ? 'bg-primary/5 border-primary' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}
            >
              {formData.certificateTemplateUrl ? (
                <>
                  <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black uppercase text-slate-900 dark:text-white truncate max-w-[200px]">{formData.certificateTemplateName || 'Modelo Carregado'}</p>
                    <p className="text-[9px] font-bold text-primary uppercase mt-1">Arquivo selecionado • Clique para trocar</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-slate-300">workspace_premium</span>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Subir modelo de certificado</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Formatos aceitos: PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </>
              )}
            </div>
            <input type="file" ref={certTemplateRef} onChange={handleCertTemplateChange} accept="application/pdf,image/*" className="hidden" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Descrição do Evento</span>
            <textarea rows={4} className="w-full p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm" placeholder="Resumo do evento..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 uppercase tracking-[0.2em] text-xs transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : (eventToEdit ? 'Salvar Alterações' : 'Publicar no SIGEA')}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateEvent;
