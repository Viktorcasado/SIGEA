import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Fingerprint } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Segurança</h1>
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Alterar senha</label>
            <input type="password" placeholder="Senha atual" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="password" placeholder="Nova senha" className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            <input type="password" placeholder="Confirmar nova senha" className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            <button className="mt-2 w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Salvar Nova Senha</button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className='flex items-center gap-2'>
                <Fingerprint className='w-5 h-5 text-gray-500' />
                <span className="text-sm font-medium text-gray-700">Acesso com Biometria</span>
            </div>
            <span className="text-sm text-gray-500">Não disponível</span>
          </div>
        </div>
      </div>
    </div>
  );
}
