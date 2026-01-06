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
  const [step, setStep] = useState(1);
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
        certificateTemplateUrl: 'blob_simulado'
      });
    }
  };

  const validateStep = () => {
    if (step === 1 && (!formData.title || !formData.type)) {
      alert("Por favor, preencha o título e o tipo do evento.");
      return false;
    }
    if (step === 2 && (!formData.campus || !formData.date)) {
      alert("Por favor, informe o campus e a data.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const eventData: Event = {
      ...formData,
      id: eventToEdit ? eventToEdit.id : Math.random().toString(36).substr(2, 9),
      status: eventToEdit ? eventToEdit.status : 'Inscrições Abertas',
      price: eventToEdit ? eventToEdit.price : 'Gratuito',
      certificateHours: formData.certificateHours
    };

    // @ts-ignore
    delete eventData.certificateTemplateName;

    if (eventToEdit && onUpdateEvent) {
      await onUpdateEvent(eventData);
    } else {
      await onAddEvent(eventData);
      navigateTo('home');
      alert("Evento publicado com sucesso!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-36 safe-top safe-bottom">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-gray-800 transition-all">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigateTo(eventToEdit ? 'manage-event' : 'home', eventToEdit?.id)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined font-black">{step > 1 ? 'arrow_back' : 'close'}</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">PASSO {step} DE 3</h2>
            <p className="text-xs font-black uppercase text-slate-900 dark:text-white">
              {step === 1 ? 'Dados Iniciais' : step === 2 ? 'Local & Data' : 'Mídia & Certificação'}
            </p>
          </div>
          <div className="size-10"></div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(19,91,236,0.3)]"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-md mx-auto w-full">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Evento</span>
              <div className="grid grid-cols-2 gap-3">
                {['Palestra', 'Workshop', 'Curso', 'Congresso'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type: type as any })}
                    className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${formData.type === type ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Título do Evento</span>
              <input
                className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm focus:border-primary transition-colors"
                placeholder="Ex: Semana de Tecnologia 2024"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Descrição</span>
              <textarea
                rows={5}
                className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm focus:border-primary transition-colors"
                placeholder="Conte o que acontecerá no evento..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Campus do IFAL</span>
              <select
                className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm"
                value={formData.campus}
                onChange={e => setFormData({ ...formData, campus: e.target.value })}
              >
                {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Local Específico</span>
              <input
                className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm"
                placeholder="Ex: Auditório Central, Lab 04"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Data</span>
                <input
                  type="text"
                  placeholder="20 Nov"
                  className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Horário</span>
                <input
                  type="text"
                  placeholder="08:00 - 18:00"
                  className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Carga Horária (Certificado)</span>
              <div className="relative">
                <input
                  type="number"
                  className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 outline-none font-bold text-sm"
                  value={formData.certificateHours}
                  onChange={e => setFormData({ ...formData, certificateHours: parseInt(e.target.value) || 0 })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Horas</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Banner do Evento</span>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[2/1] rounded-3xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all"
              >
                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-3xl">upload_file</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Modelo de Certificado (PDF/JPG)</span>
              <div
                onClick={() => certTemplateRef.current?.click()}
                className={`w-full p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${formData.certificateTemplateUrl ? 'bg-primary/5 border-primary' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'}`}
              >
                <span className={`material-symbols-outlined text-3xl ${formData.certificateTemplateUrl ? 'text-primary' : 'text-slate-300'}`}>
                  {formData.certificateTemplateUrl ? 'check_circle' : 'workspace_premium'}
                </span>
                <p className="text-[10px] font-black uppercase text-slate-500 text-center leading-tight">
                  {formData.certificateTemplateName || 'Clique para subir o arquivo'}
                </p>
              </div>
              <input type="file" ref={certTemplateRef} onChange={handleCertTemplateChange} accept="application/pdf,image/*" className="hidden" />
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-gray-800 flex gap-4 z-50">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-5 border-2 border-slate-200 dark:border-slate-700 rounded-3xl font-black text-xs uppercase active:scale-95 transition-all"
          >
            Voltar
          </button>
        )}
        <button
          onClick={() => step < 3 ? nextStep() : handleSubmit()}
          disabled={loading}
          className="flex-[2] py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 uppercase text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <span className="material-symbols-outlined animate-spin text-xl">sync</span> : (step < 3 ? 'Próximo Passo' : (eventToEdit ? 'Salvar Evento' : 'Publicar Evento'))}
        </button>
      </footer>
    </div>
  );
};

export default CreateEvent;
    </div >
  );
};

export default CreateEvent;
