import { useState } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [nome, setNome] = useState(user?.nome || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      alert('O nome completo é obrigatório.');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // updateUser({ nome, telefone }); // TODO: Implementar com Supabase
      setIsLoading(false);
      alert('Dados atualizados com sucesso!');
      navigate('/perfil');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Editar Dados do Perfil</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome completo</label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email" id="email" value={user?.email || ''} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500" />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone (opcional)</label>
            <input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full px-4 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}
