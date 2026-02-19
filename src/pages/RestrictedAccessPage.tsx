import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function RestrictedAccessPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <ShieldAlert className="w-24 h-24 mx-auto text-orange-400" />
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Acesso Restrito</h1>
        <p className="mt-2 text-lg text-gray-600">Você não tem permissão para acessar esta página.</p>
        <p className="mt-1 text-gray-500">Seu perfil de usuário atual não permite a visualização deste conteúdo. Se você acredita que isso é um erro, entre em contato com o suporte.</p>
        <Link 
            to="/"
            className="mt-8 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            Voltar para a Página Inicial
        </Link>
    </div>
  );
}
