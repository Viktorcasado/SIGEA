import { useState, useEffect } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Paperclip } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { validateCPF } from '@/src/utils/cpf';

export default function DocumentsPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [cpf, setCpf] = useState(user?.cpf || '');
  const [isCpfValid, setIsCpfValid] = useState(true);
  const [matricula, setMatricula] = useState(user?.matricula || '');
  const [siape, setSiape] = useState(user?.siape || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cpf.replace(/\D/g, '').length === 11) {
      setIsCpfValid(validateCPF(cpf));
    }
  }, [cpf]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cpf.replace(/\D/g, ''));
    alert('CPF copiado (somente números)!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCPF(cpf)) {
      setIsCpfValid(false);
      alert('CPF inválido. Verifique os números.');
      return;
    }
    // Add validation for matricula/siape if needed
    setIsLoading(true);
    setTimeout(() => {
      // updateUser({ cpf, matricula, siape }); // TODO: Implementar com Supabase
      setIsLoading(false);
      alert('Documentos atualizados!');
      navigate('/perfil');
    }, 1000);
  };

  const renderInstitutionalFields = () => {
    if (!user) return null;
    switch (user.perfil) {
      case 'aluno':
        return (
          <div>
            <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">Matrícula</label>
            <input type="text" id="matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Ex.: 202512345" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        );
      case 'servidor':
      case 'gestor':
        return (
          <div>
            <label htmlFor="siape" className="block text-sm font-medium text-gray-700">SIAPE</label>
            <input type="text" id="siape" value={siape} onChange={(e) => setSiape(e.target.value)} placeholder="Ex.: 1234567" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        );
      case 'comunidade_externa':
        return (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">Para comunidade externa, matrícula/SIAPE não se aplica.</p>
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-900">CPF</h2>
          <div className="mt-4">
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">Número do CPF</label>
            <div className="relative mt-1">
              <IMaskInput
                mask="000.000.000-00"
                value={cpf}
                onAccept={(value: any) => setCpf(value)}
                id="cpf"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${!isCpfValid && 'border-red-500'}`}
              />
              <button type="button" onClick={copyToClipboard} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600">
                <Copy className="w-5 h-5" />
              </button>
            </div>
            {!isCpfValid && <p className="mt-2 text-sm text-red-600">CPF inválido. Verifique os números.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-900">Vínculo Institucional</h2>
            <div className="mt-4 space-y-4">
                {renderInstitutionalFields()}
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-900">Anexos</h2>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                <Paperclip className='w-5 h-5 text-gray-400' />
                <span>O envio de anexos comprobatórios será habilitado na homologação do sistema.</span>
            </div>
        </div>

        <div className="flex gap-4">
            <button type="submit" disabled={isLoading || !isCpfValid} className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => navigate('/perfil')} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                Voltar
            </button>
        </div>
      </form>
    </div>
  );
}
