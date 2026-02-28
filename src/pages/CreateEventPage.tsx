import { useState } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Info, Users, Image as ImageIcon, Save, Globe, Building2 } from 'lucide-react';
import { Event, EventInstitution, EventModality } from '@/src/types';
import { supabase } from '@/src/services/supabase';
import { motion } from 'motion/react';

export default function CreateEventPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [instituicao, setInstituicao] = useState<EventInstitution | ''>(user?.instituicao || 'IFAL');
  const [campus, setCampus] = useState(user?.campus || '');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [modalidade, setModalidade] = useState<EventModality>('Presencial');
  const [local, setLocal] = useState('');
  const [link, setLink] = useState('');
  const [vagas, setVagas] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !descricao || !dataInicio) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: titulo,
          description: descricao,
          date: dataInicio,
          location: modalidade === 'Online' ? link : local,
          campus: campus,
          organizer_id: user?.id,
          workload: 0, // Será calculado pelas atividades
        })
        .select()
        .single();

      if (error) throw error;
      
      alert('Evento criado com sucesso!');
      navigate(`/evento/${data.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Erro ao salvar o evento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-10">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 font-bold group mb-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Voltar
        </button>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Criar Novo Evento</h1>
        <p className="text-gray-500 font-bold mt-1">Preencha as informações básicas para começar.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção: Informações Básicas */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Info className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Informações Gerais</h2>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Título do Evento *</label>
                    <input 
                        type="text" 
                        value={titulo} 
                        onChange={e => setTitulo(e.target.value)} 
                        placeholder="Ex: I Semana de Tecnologia do IFAL"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição Detalhada *</label>
                    <textarea 
                        value={descricao} 
                        onChange={e => setDescricao(e.target.value)} 
                        rows={5}
                        placeholder="Conte mais sobre o objetivo do evento, público-alvo e o que esperar..."
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        required
                    />
                </div>
            </div>
        </section>

        {/* Seção: Localização e Modalidade */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Onde e Quando</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Modalidade</label>
                    <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                        {['Presencial', 'Online', 'Híbrido'].map((mod) => (
                            <button
                                key={mod}
                                type="button"
                                onClick={() => setModalidade(mod as EventModality)}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    modalidade === mod 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {mod}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data de Início *</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="date" 
                            value={dataInicio} 
                            onChange={e => setDataInicio(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Campus / Instituição</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            value={campus} 
                            onChange={e => setCampus(e.target.value)}
                            placeholder="Ex: Campus Maceió"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        {modalidade === 'Online' ? 'Link da Transmissão' : 'Local / Endereço'}
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            value={modalidade === 'Online' ? link : local} 
                            onChange={e => modalidade === 'Online' ? setLink(e.target.value) : setLocal(e.target.value)}
                            placeholder={modalidade === 'Online' ? "https://youtube.com/..." : "Auditório Principal, Bloco A"}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Seção: Vagas */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Capacidade</h2>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Número de Vagas (opcional)</label>
                <input 
                    type="number" 
                    value={vagas || ''} 
                    onChange={e => setVagas(e.target.value ? parseInt(e.target.value) : undefined)} 
                    placeholder="Deixe vazio para ilimitado"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                />
            </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-indigo-600 text-white font-black rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:bg-gray-300"
            >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {isLoading ? 'Criando Evento...' : 'Criar Evento'}
            </button>
            <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-8 py-5 bg-white border border-gray-200 text-gray-600 font-black rounded-[2rem] hover:bg-gray-50 transition-all active:scale-95"
            >
                Cancelar
            </button>
        </div>
      </form>
    </div>
  );
}

import { Loader2 as LoaderIcon } from 'lucide-react';