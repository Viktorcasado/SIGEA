
import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { supabase, uploadFile, handleSupabaseError } from '../supabaseClient';

interface CertificatesProps {
  navigateTo: (page: string, id?: string) => void;
  eventId: string | null;
  user: any;
  role?: UserRole;
}

const CATEGORIES = [
  { id: 'Participantes', label: 'Participantes', color: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-500', defaultText: 'Certificamos que {{NOME}}, participou na condição de PARTICIPANTE do evento {{EVENTO}}, realizado no {{CAMPUS}}, no período de {{DATA}}, com carga horária total de {{HORAS}} horas.' },
  { id: 'Palestrantes', label: 'Palestrantes', color: 'bg-indigo-500', light: 'bg-indigo-500/10', text: 'text-indigo-500', defaultText: 'Certificamos que {{NOME}}, atuou como PALESTRANTE no evento {{EVENTO}}, proferindo atividades acadêmicas no {{CAMPUS}}, em {{DATA}}, totalizando {{HORAS}} horas de atividades.' },
  { id: 'Convidados', label: 'Convidados', color: 'bg-amber-500', light: 'bg-amber-500/10', text: 'text-amber-500', defaultText: 'Certificamos que {{NOME}}, participou como CONVIDADO ESPECIAL do evento {{EVENTO}}...' },
  { id: 'Organizadores', label: 'Comissão', color: 'bg-slate-500', light: 'bg-slate-500/10', text: 'text-slate-500', defaultText: 'Certificamos que {{NOME}}, integrou a COMISSÃO ORGANIZADORA do evento {{EVENTO}}...' }
];

const Certificates: React.FC<CertificatesProps> = ({ navigateTo, eventId, user, role = UserRole.PARTICIPANT }) => {
  const [activeTab, setActiveTab] = useState<'modelos' | 'emissao' | 'meus'>('modelos');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [userCertificates, setUserCertificates] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todos');
  
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [newCert, setNewCert] = useState({ 
    title: '', 
    attribution: 'Participantes',
    hours: 10,
    content_template: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOrganizer = role === UserRole.ORGANIZER;

  useEffect(() => {
    if (isOrganizer && eventId) {
      fetchTemplates();
    } else if (!isOrganizer) {
      fetchUserCertificates();
    }
  }, [eventId, role]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (!error && data) setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCertificates = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*, events(title, date, campus)')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });
      
      if (!error && data) setUserCertificates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cert: any) => {
    setEditingCertId(cert.id);
    setNewCert({
      title: cert.title,
      attribution: cert.attribution,
      hours: cert.hours,
      content_template: cert.content_template || ''
    });
    setPreviewUrl(cert.image_url);
    setSelectedFile(null);
    setShowAddModal(true);
  };

  // Fix: Added handleFileChange function to handle input file changes and updates preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem é muito grande. O limite máximo é 5MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCertificate = async () => {
    if (!newCert.title || (!selectedFile && !editingCertId)) {
      alert("Informe o título e selecione a imagem de fundo.");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = previewUrl;

      if (selectedFile) {
        const fileName = `tpl-${eventId}-${Date.now()}.png`;
        const filePath = `certificates/${eventId}/${fileName}`;
        imageUrl = await uploadFile('assets', filePath, selectedFile);
      }

      const payload = {
        event_id: eventId,
        title: newCert.title.toUpperCase(),
        attribution: newCert.attribution,
        hours: newCert.hours,
        content_template: newCert.content_template,
        status: 'Ativo',
        image_url: imageUrl
      };

      if (editingCertId) {
        const { error } = await supabase
          .from('certificate_templates')
          .update(payload)
          .eq('id', editingCertId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('certificate_templates').insert([payload]);
        if (error) throw error;
      }
      
      setShowAddModal(false);
      setEditingCertId(null);
      setNewCert({ title: '', attribution: 'Participantes', hours: 10, content_template: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchTemplates();
    } catch (err: any) {
      alert(handleSupabaseError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const insertPlaceholder = (tag: string) => {
    setNewCert(prev => ({
      ...prev,
      content_template: prev.content_template + ` {{${tag}}}`
    }));
  };

  const renderOrganizerView = () => (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-500 pb-32">
      <header className="p-8 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigateTo('manage-event', eventId!)} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-500 active:scale-90 transition-all">
             <span className="material-symbols-outlined font-black">arrow_back</span>
           </button>
           <div className="flex flex-col">
             <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Certificação</h1>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Redação Oficial e Modelos A4</p>
           </div>
        </div>
        
        <div className="flex gap-8 border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('modelos')} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'modelos' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Modelos Dinâmicos</button>
          <button onClick={() => setActiveTab('emissao')} className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'emissao' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Emissão em Massa</button>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto w-full">
        {activeTab === 'modelos' && (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <button onClick={() => setFilterCategory('Todos')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterCategory === 'Todos' ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white dark:bg-zinc-900 text-slate-400 border-slate-200 dark:border-white/5'}`}>Todos</button>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setFilterCategory(cat.id)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterCategory === cat.id ? `${cat.color} text-white border-transparent` : 'bg-white dark:bg-zinc-900 text-slate-400 border-slate-200 dark:border-white/5'}`}>{cat.label}</button>
                ))}
              </div>
              <button 
                onClick={() => { setEditingCertId(null); setNewCert({title: '', attribution: 'Participantes', hours: 10, content_template: CATEGORIES[0].defaultText}); setPreviewUrl(null); setShowAddModal(true); }}
                className="h-14 px-8 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                <span className="material-symbols-outlined">description</span> Novo Modelo Institucional
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {templates.filter(t => filterCategory === 'Todos' || t.attribution === filterCategory).map(cert => {
                const catInfo = CATEGORIES.find(c => c.id === cert.attribution) || CATEGORIES[0];
                return (
                  <div key={cert.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl group transition-all">
                    <div className="aspect-[1.414/1] bg-slate-100 dark:bg-zinc-800 relative group-hover:brightness-90 transition-all">
                      <img src={cert.image_url} className="w-full h-full object-cover" alt="Certificado" />
                      <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl ${catInfo.color} text-white`}>{cert.attribution}</div>
                    </div>
                    <div className="p-8">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{cert.title}</h4>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 italic mb-8 line-clamp-2">"{cert.content_template}"</p>
                      <div className="flex gap-3">
                         <button onClick={() => handleEdit(cert)} className="flex-1 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-[10px] font-black uppercase text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/5 active:scale-95 transition-all">Editar Ementa</button>
                         <button className="size-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center active:scale-95 transition-all"><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'emissao' && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in">
             <div className="size-24 rounded-[2.5rem] bg-primary/10 text-primary flex items-center justify-center shadow-inner"><span className="material-symbols-outlined text-5xl">auto_awesome</span></div>
             <div className="max-w-md space-y-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Emissão Automatizada</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Os certificados serão emitidos e disparados via e-mail para todos os participantes com presença homologada.</p>
             </div>
             <button className="h-16 px-12 bg-zinc-900 text-white dark:bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">Processar Lote de Envio</button>
          </div>
        )}
      </main>

      {/* Modal Avançado: Fundo + Redação Oficial */}
      {showAddModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isSaving && setShowAddModal(false)}></div>
           <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[3.5rem] p-10 shadow-2xl border border-white/5 max-h-[95vh] overflow-y-auto no-scrollbar">
              <header className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{editingCertId ? 'Ajustar Ementa' : 'Novo Modelo A4'}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Padrão de Redação Institucional</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="size-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition-all"><span className="material-symbols-outlined">close</span></button>
              </header>

              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Público Destinado</label>
                        <select 
                          value={newCert.attribution}
                          onChange={e => {
                            const cat = CATEGORIES.find(c => c.id === e.target.value);
                            setNewCert({...newCert, attribution: e.target.value, content_template: cat?.defaultText || ''});
                          }}
                          className="w-full h-18 px-6 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-[2rem] font-black text-sm outline-none appearance-none cursor-pointer"
                        >
                           {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Carga Horária (Padrão)</label>
                        <input type="number" value={newCert.hours} onChange={e => setNewCert({...newCert, hours: parseInt(e.target.value) || 0})} className="w-full h-18 px-8 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-[2rem] font-black text-sm outline-none" />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Texto Institucional (Dinamizado)</label>
                       <div className="flex gap-2">
                          {['NOME', 'EVENTO', 'CAMPUS', 'DATA', 'VALIDACAO'].map(tag => (
                            <button key={tag} onClick={() => insertPlaceholder(tag)} className="px-2 py-1 bg-primary/10 text-primary text-[8px] font-black rounded-lg border border-primary/20 transition-all hover:bg-primary hover:text-white uppercase tracking-tight">{`{{${tag}}}`}</button>
                          ))}
                       </div>
                    </div>
                    <textarea 
                      value={newCert.content_template}
                      onChange={e => setNewCert({...newCert, content_template: e.target.value})}
                      placeholder="Utilize {{NOME}} para o nome do participante..."
                      rows={5}
                      className="w-full p-6 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-[2rem] font-medium text-sm leading-relaxed outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                    />
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Papel de Fundo (PNG/JPG)</label>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">Resolução A4 (1.414 : 1)</span>
                    </div>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[1.414/1] w-full bg-slate-50 dark:bg-zinc-900 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center text-slate-300 hover:border-primary transition-all group relative cursor-pointer"
                    >
                       {previewUrl ? (
                         <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                       ) : (
                         <div className="text-center p-12 space-y-4">
                            <span className="material-symbols-outlined text-5xl text-primary">add_a_photo</span>
                            <div>
                               <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Selecionar Imagem do Modelo</p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Proporção: 3508 x 2480 px</p>
                            </div>
                         </div>
                       )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                 </div>
              </div>

              <div className="mt-12 flex gap-4">
                 <button onClick={() => setShowAddModal(false)} disabled={isSaving} className="flex-1 h-18 bg-slate-100 dark:bg-zinc-900 text-slate-400 font-black rounded-3xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">Descartar</button>
                 <button 
                  onClick={handleSaveCertificate}
                  disabled={isSaving}
                  className="flex-[2] h-18 bg-primary text-white font-black rounded-3xl uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                   {isSaving ? <div className="size-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span className="material-symbols-outlined">save</span> {editingCertId ? 'Salvar Edição' : 'Publicar Modelo'}</>}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950">
      {isOrganizer ? renderOrganizerView() : (
        <div className="flex-1 flex flex-col pb-32">
           <header className="px-8 py-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 flex items-center gap-6">
              <button onClick={() => navigateTo('home')} className="size-12 rounded-2xl bg-white dark:bg-zinc-900 border border-white/10 flex items-center justify-center active:scale-90 transition-all"><span className="material-symbols-outlined">arrow_back</span></button>
              <div className="flex flex-col">
                 <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Meus Títulos</h1>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Validado pelo SIGEA IFAL</p>
              </div>
           </header>
           <main className="p-8 flex-1 flex flex-col items-center justify-center">
              {userCertificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                   {userCertificates.map(cert => (
                     <div key={cert.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl transition-all hover:scale-[1.02]">
                        <div className="aspect-[1.414/1] bg-slate-100 relative group">
                           <img src={cert.template_url} className="w-full h-full object-cover" alt="Certificado" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all">
                              <button className="size-16 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl active:scale-90 transition-all"><span className="material-symbols-outlined text-3xl">print</span></button>
                              <button className="size-16 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl active:scale-90 transition-all"><span className="material-symbols-outlined text-3xl">download</span></button>
                           </div>
                        </div>
                        <div className="p-8">
                           <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 truncate">{cert.event_title}</h4>
                           <div className="flex items-center justify-between border-t border-white/5 pt-4">
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-sm">verified</span> Autenticado</span>
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{cert.hours}H</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center space-y-8 animate-in slide-in-from-bottom-8">
                   <div className="size-32 rounded-[2.5rem] bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-slate-300"><span className="material-symbols-outlined text-6xl">workspace_premium</span></div>
                   <div className="max-w-xs space-y-4">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Acervo Digital Vazio</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Seus certificados aparecerão aqui após a homologação das atividades pela coordenação do campus.</p>
                   </div>
                </div>
              )}
           </main>
        </div>
      )}
    </div>
  );
};

export default Certificates;
