import { useState } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Event, EventInstitution, EventModality } from '@/src/types';

// This would be in a repository file in a real app
import { mockEvents } from '@/src/data/mock';

const createEventMock = (eventData: Omit<Event, 'id' | 'status'>) => {
  const newEvent: Event = {
    ...eventData,
    id: `evt${Date.now()}`,
    status: 'rascunho',
  };
  mockEvents.push(newEvent);
  return newEvent;
};

export default function CreateEventPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [instituicao, setInstituicao] = useState<EventInstitution | ''>(user?.instituicao || '');
  const [campus, setCampus] = useState(user?.campus || '');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [modalidade, setModalidade] = useState<EventModality>('Presencial');
  const [local, setLocal] = useState('');
  const [link, setLink] = useState('');
  const [vagas, setVagas] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent, andGoToDetails = false) => {
    e.preventDefault();
    // Add full validation here
    if (titulo.length < 5 || descricao.length < 20) {
        alert('Preencha o título e a descrição corretamente.');
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
        const newEvent = createEventMock({
            titulo,
            descricao,
            instituicao: instituicao as EventInstitution,
            campus,
            dataInicio: new Date(dataInicio),
            dataFim: new Date(dataFim),
            modalidade,
            local: `${local}${link && ' / ' + link}`,
            vagas
        });
        setIsLoading(false);
        alert('Evento salvo com sucesso!');
        if (andGoToDetails) {
            navigate(`/evento/${newEvent.id}`);
        } else {
            navigate('/');
        }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">Criar Novo Evento</h1>

      <form className="mt-8 space-y-8">
        {/* Section 1: Info */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800">Informações</h2>
            <div className="mt-4 grid grid-cols-1 gap-6">
                <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título do evento</label>
                    <input type="text" id="titulo" value={titulo} onChange={e => setTitulo(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
            </div>
        </div>

        {/* Section 4: Modality */}
                {/* Section 2: Institution */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800">Instituição e Campus</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="instituicao" className="block text-sm font-medium text-gray-700">Instituição</label>
                    <select id="instituicao" value={instituicao} onChange={e => setInstituicao(e.target.value as EventInstitution)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="IFAL">IFAL</option>
                        <option value="UFAL">UFAL</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="campus" className="block text-sm font-medium text-gray-700">Campus</label>
                    <input type="text" id="campus" value={campus} onChange={e => setCampus(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>
        </div>

        {/* Section 3: Dates */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800">Datas</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">Data de Início</label>
                    <input type="date" id="dataInicio" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700">Data de Fim</label>
                    <input type="date" id="dataFim" value={dataFim} onChange={e => setDataFim(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800">Modalidade e Local</h2>
            <div className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Modalidade</label>
                    <div className="mt-2 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setModalidade('Presencial')} className={`flex-1 px-4 py-2 text-sm font-medium border ${modalidade === 'Presencial' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} rounded-l-md`}>Presencial</button>
                        <button type="button" onClick={() => setModalidade('Online')} className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b ${modalidade === 'Online' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}>Online</button>
                        <button type="button" onClick={() => setModalidade('Híbrido')} className={`flex-1 px-4 py-2 text-sm font-medium border ${modalidade === 'Híbrido' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'} rounded-r-md`}>Híbrido</button>
                    </div>
                </div>
                {(modalidade === 'Presencial' || modalidade === 'Híbrido') && (
                    <div>
                        <label htmlFor="local" className="block text-sm font-medium text-gray-700">Local</label>
                        <input type="text" id="local" value={local} onChange={e => setLocal(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                )}
                {(modalidade === 'Online' || modalidade === 'Híbrido') && (
                    <div>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link</label>
                        <input type="url" id="link" value={link} onChange={e => setLink(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                )}
            </div>
        </div>

        {/* Section 5: Vagas */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800">Vagas e Público-alvo</h2>
            <div className="mt-4">
                <label htmlFor="vagas" className="block text-sm font-medium text-gray-700">Número de Vagas (deixe em branco para ilimitado)</label>
                <input type="number" id="vagas" value={vagas || ''} onChange={e => setVagas(e.target.value ? parseInt(e.target.value) : undefined)} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/')} className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-semibold">Cancelar</button>
            <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={isLoading} className="px-6 py-2.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold">{isLoading ? 'Salvando...' : 'Salvar Rascunho'}</button>
            <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isLoading} className="px-6 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 font-semibold">{isLoading ? 'Salvando...' : 'Salvar e Ver Detalhes'}</button>
        </div>
      </form>
    </div>
  );
}
