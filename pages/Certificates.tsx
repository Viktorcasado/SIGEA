
import React, { useState, useEffect } from 'react';
import { Event, Certificate, UserRole } from '../types';
import { supabase } from '../supabaseClient';

interface CertificatesProps {
  navigateTo: (page: string) => void;
  events: Event[];
  user: any;
  role?: UserRole;
}

const Certificates: React.FC<CertificatesProps> = ({ navigateTo, user, role = UserRole.PARTICIPANT }) => {
  const [activeTab, setActiveTab] = useState<'criar' | 'envio' | 'config'>('criar');
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);

  const isOrganizer = role === UserRole.ORGANIZER;

  useEffect(() => {
    if (user?.id) fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    setLoading(true);
    // Simulação de certificados cadastrados (estilo Even3)
    setCertificates([
      { id: '1', title: 'Certificado de Participação', type: 'Gratuito', attribution: 'Somente os credenciados', status: 'Publicado' },
      { id: '2', title: 'Certificado de Atividade', type: 'Gratuito', attribution: 'Todos inscritos na atividade', status: 'Publicado' },
      { id: '3', title: 'Certificado de Convidado', type: 'Gratuito', attribution: 'Convidados associados a atividades', status: 'Publicado' },
    ]);
    setLoading(false);
  };

  const renderOrganizerView = () => (
    <div className="flex flex-col w-full h-full bg-white dark:bg-zinc-950">
      <header className="p-8 border-b border-slate-200 dark:border-white/5">
        <h1 className="text-2xl font-light text-slate-800 dark:text-white mb-8">Certificado</h1>
        
        <div className="flex gap-8 border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('criar')} className={`pb-4 text-sm transition-all relative ${activeTab === 'criar' ? 'text-primary border-b-2 border-primary font-medium' : 'text-slate-400'}`}>Criar</button>
          <button onClick={() => setActiveTab('envio')} className={`pb-4 text-sm transition-all relative ${activeTab === 'envio' ? 'text-primary border-b-2 border-primary font-medium' : 'text-slate-400'}`}>Envio por email</button>
          <button onClick={() => setActiveTab('config')} className={`pb-4 text-sm transition-all relative ${activeTab === 'config' ? 'text-primary border-b-2 border-primary font-medium' : 'text-slate-400'}`}>Configurações</button>
        </div>
      </header>

      <main className="p-8">
        {activeTab === 'criar' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl text-slate-700 dark:text-slate-200">Criar Certificados</h2>
              <button className="h-10 px-6 bg-primary text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-secondary transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                Adicionar certificado
              </button>
            </div>

            <div className="overflow-hidden border border-slate-200 dark:border-white/5 rounded-lg shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-white/5">
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Título</th>
                    <th className="px-6 py-4">Modelo</th>
                    <th className="px-6 py-4">Atribuição</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {certificates.map(cert => (
                    <tr key={cert.id} className="text-sm text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-6 py-5 font-medium">{cert.title}</td>
                      <td className="px-6 py-5 text-primary cursor-pointer hover:underline">Alterar modelo</td>
                      <td className="px-6 py-5 flex items-center gap-2">
                        {cert.attribution}
                        <span className="material-symbols-outlined text-sm text-slate-300">arrow_drop_down</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-md text-[10px] font-bold uppercase">
                          {cert.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
            <h2 className="text-xl text-slate-700 dark:text-slate-200">Configurações</h2>
            
            <div className="p-8 border border-slate-200 dark:border-white/5 rounded-lg space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Comunicação</h3>
              <p className="text-sm text-slate-500">Edite o conteúdo do email que o participante vai receber ao ser enviado o certificado</p>
              <button className="w-full h-12 border border-slate-300 dark:border-white/10 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <span className="material-symbols-outlined text-xl">mail</span>
                Editar comunicação
              </button>
            </div>

            <div className="p-8 border border-slate-200 dark:border-white/5 rounded-lg space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Formato de publicação</h3>
              <p className="text-sm text-slate-500">Defina como os certificados vão ser liberados</p>
              <button className="w-full h-12 border border-slate-300 dark:border-white/10 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <span className="material-symbols-outlined text-xl">edit_note</span>
                Editar formato
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 animate-in fade-in duration-500">
      {isOrganizer ? renderOrganizerView() : (
        <>
          <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-6 py-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="size-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white active:scale-90 transition-all">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Meus Títulos</h1>
            </div>
          </header>
          <main className="p-6">
            <p className="text-slate-500 text-sm">Visualização de participante padrão...</p>
          </main>
        </>
      )}
    </div>
  );
};

export default Certificates;
