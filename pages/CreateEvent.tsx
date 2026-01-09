
import React, { useState, useRef } from 'react';
import { Event } from '../types';
import { CAMPUS_LIST } from '../constants';
import { supabase, handleSupabaseError, uploadFile } from '../supabaseClient';

interface CreateEventProps {
  navigateTo: (page: string, id?: string) => void;
  onAddEvent: (event: Event) => Promise<void> | void;
  profile: any;
}

const CreateEvent: React.FC<CreateEventProps> = ({ navigateTo, onAddEvent, profile }) => {
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campus: CAMPUS_LIST[0],
    date: '',
    time: '08:00 - 18:00',
    location: 'Auditório Principal',
    type: 'Congresso',
    certificateHours: 10
  });

  const handleNext = () => step < 3 && setStep(s => s + 1);
  const handleBack = () => step > 1 ? setStep(s => s - 1) : navigateTo('home');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validações client-side imediatas
      if (!file.type.startsWith('image/')) {
        setErrorModal({ show: true, msg: 'Apenas arquivos de imagem (PNG, JPG, WEBP) são permitidos.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrorModal({ show: true, msg: 'O arquivo é muito grande. O limite máximo é 5MB.' });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // 1. Validação básica de campos
    if (!formData.title || !formData.date) {
      setErrorModal({ show: true, msg: 'Por favor, preencha o título e a data do evento para continuar.' });
      return;
    }

    if (!profile?.id) {
      setErrorModal({ show: true, msg: 'Sessão inválida. Por favor, faça login novamente.' });
      return;
    }

    setIsPublishing(true);
    setUploadProgress(true);
    
    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000';

      // 2. Upload da imagem (Se falhar, cairá no Catch e manterá o formulário aberto)
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `events/${profile.id}/${fileName}`;
        
        try {
          finalImageUrl = await uploadFile('assets', filePath, selectedFile);
        } catch (uploadErr: any) {
          console.error("Falha no Upload do Banner:", uploadErr);
          setIsPublishing(false);
          setUploadProgress(false);
          setErrorModal({ 
            show: true, 
            msg: `Erro ao enviar banner: ${uploadErr.message}. Verifique sua conexão e tente novamente.` 
          });
          return; // INTERROMPE aqui para o usuário não perder os dados e poder tentar de novo
        }
      }

      setUploadProgress(false); // Fim da fase de upload

      // 3. Inserção no Banco de Dados
      const dbEventPayload = {
        title: formData.title.toUpperCase(),
        description: formData.description,
        campus: formData.campus,
        date: formData.date.toUpperCase(),
        time: formData.time,
        location: formData.location,
        image_url: finalImageUrl,
        type: formData.type,
        status: 'Inscrições Abertas',
        price: 'Gratuito',
        certificate_hours: formData.certificateHours,
        organizer_id: profile.id
      };

      const { data, error } = await supabase.from('events').insert([dbEventPayload]).select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newEvent: Event = {
          ...data[0],
          id: data[0].id,
          imageUrl: data[0].image_url,
          certificateHours: data[0].certificate_hours
        } as Event;

        localStorage.setItem(`last_published_${newEvent.id}`, JSON.stringify(newEvent));
        
        // Sincroniza e Navega apenas no SUCESSO TOTAL
        await onAddEvent(newEvent);
        navigateTo('publish-success', newEvent.id);
      }
    } catch (err: any) {
      console.error("Erro na Publicação Final:", err);
      setIsPublishing(false);
      setUploadProgress(false);
      setErrorModal({ 
        show: true, 
        msg: "Não foi possível salvar o evento: " + handleSupabaseError(err) 
      });
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500 overflow-x-hidden">
      {/* Modal de Erro Institucional */}
      {errorModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in zoom-in">
          <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-6">warning</span>
            <p className="text-white text-xs font-black uppercase tracking-tight mb-8 leading-relaxed">
              {errorModal.msg}
            </p>
            <button 
              onClick={() => setErrorModal({show:false, msg:''})} 
              className="w-full h-16 bg-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 transition-all"
            >
              Corrigir e Tentar Novamente
            </button>
          </div>
        </div>
      )}

      <header className="p-6 lg:p-8 border-b border-zinc-100 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack} 
            disabled={isPublishing}
            className="size-14 lg:size-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 active:scale-90 transition-all border border-transparent dark:border-white/5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-[12px] font-[900] uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Novo Evento</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Etapa {step}/3</p>
          </div>
          <div className="size-14 lg:size-12"></div>
        </div>
        <div className="max-w-3xl mx-auto mt-6 h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_12px_#10b981]" style={{width: `${(step/3)*100}%`}}></div>
        </div>
      </header>

      <main className="p-6 lg:p-12 space-y-10 max-w-3xl mx-auto w-full flex-1">
        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6">
            <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Dados <br /> <span className="text-primary">Gerais</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Preencha com atenção, estas informações aparecerão nos certificados.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-3 col-span-full">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Título do Evento</label>
                <input 
                  type="text" 
                  placeholder="EX: I SEMANA DE INFORMÁTICA" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none focus:border-primary transition-all shadow-sm"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Campus / Unidade</label>
                <div className="relative">
                  <select 
                    value={formData.campus}
                    onChange={e => setFormData({...formData, campus: e.target.value})}
                    className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Carga Horária (h)</label>
                <input 
                  type="number" 
                  value={formData.certificateHours}
                  onChange={e => setFormData({...formData, certificateHours: parseInt(e.target.value) || 0})}
                  className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-6">
             <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Local e <br /> <span className="text-primary">Horário</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Defina onde e quando a atividade ocorrerá.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Data de Realização</label>
                <input type="text" placeholder="EX: 20 DE MAIO" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-20 lg:h-18 px-6 w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Intervalo de Tempo</label>
                <input type="text" placeholder="EX: 14:00 ÀS 18:00" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-20 lg:h-18 px-6 w-full bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
              <div className="space-y-3 col-span-full">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Local Físico / Sala</label>
                <input type="text" placeholder="EX: AUDITÓRIO CENTRAL - BLOCO A" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full h-20 lg:h-18 px-6 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-3xl font-black text-sm dark:text-white outline-none" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
             <div className="space-y-3">
              <h2 className="text-[36px] lg:text-[48px] font-[1000] text-zinc-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Mídia e <br /> <span className="text-primary">Apresentação</span></h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">O banner é a primeira impressão do seu evento.</p>
            </div>

            <div className="space-y-8">
              <div 
                onClick={() => !isPublishing && fileInputRef.current?.click()}
                className={`aspect-video w-full rounded-[3rem] bg-slate-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-white/5 overflow-hidden shadow-inner relative group cursor-pointer transition-all hover:border-primary/50 ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleFileChange} 
                />
                
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Banner Preview" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                    <span className="material-symbols-outlined text-6xl opacity-20">cloud_upload</span>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Toque para selecionar imagem</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-30 mt-1">PNG ou JPG (Até 5MB)</p>
                    </div>
                  </div>
                )}

                {previewUrl && !isPublishing && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <span className="material-symbols-outlined text-white text-4xl">sync_alt</span>
                  </div>
                )}
                
                {uploadProgress && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="size-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <p className="mt-4 text-[9px] font-black text-white uppercase tracking-widest">Enviando Arquivo...</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Ementa / Descrição</label>
                <textarea 
                  rows={4}
                  placeholder="Descreva os objetivos e a programação do evento..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-8 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 rounded-[3rem] font-bold text-sm dark:text-white outline-none resize-none shadow-sm focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 lg:p-8 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl border-t border-zinc-100 dark:border-white/5 flex gap-5 z-[100] h-32 lg:h-28 items-center">
        <div className="max-w-3xl mx-auto w-full flex gap-5">
          <button 
            onClick={handleBack} 
            disabled={isPublishing}
            className="flex-1 h-16 lg:h-14 bg-slate-100 dark:bg-zinc-900 text-slate-500 font-black rounded-3xl uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            Anterior
          </button>
          <button 
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={isPublishing}
            className="flex-[2] h-16 lg:h-14 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50"
          >
            {isPublishing ? (
              <div className="flex items-center gap-3">
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{uploadProgress ? 'ENVIANDO...' : 'SALVANDO...'}</span>
              </div>
            ) : (
              <>
                {step === 3 ? 'Publicar Atividade' : 'Próxima Etapa'}
                <span className="material-symbols-outlined text-xl">{step === 3 ? 'rocket_launch' : 'arrow_forward'}</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CreateEvent;
