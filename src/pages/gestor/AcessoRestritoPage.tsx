import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function AcessoRestritoPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800">Acesso Restrito</h1>
      <p className="text-gray-600 mt-2">Você não tem permissão para acessar esta página.</p>
      <Link 
        to="/"
        className="mt-6 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}
