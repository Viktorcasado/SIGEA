import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <h1 className="text-3xl font-bold text-gray-800">Criar Conta</h1>
      <p className="text-gray-600 mt-2">A funcionalidade de criação de conta está em desenvolvimento.</p>
      <Link 
        to="/login"
        className="mt-6 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Voltar para o Login
      </Link>
    </div>
  );
}
