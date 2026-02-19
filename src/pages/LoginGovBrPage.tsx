import { Link } from 'react-router-dom';

export default function LoginGovBrPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <h1 className="text-3xl font-bold text-gray-800">Acesso com gov.br</h1>
      <p className="text-gray-600 mt-2 max-w-md">
        A integração direta com o gov.br está em desenvolvimento. Por enquanto, por favor, utilize o acesso com seu e-mail e senha ou através do Google.
      </p>
      <Link 
        to="/login"
        className="mt-6 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Voltar para o Login
      </Link>
    </div>
  );
}
