import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-500 mt-2">Este módulo está em desenvolvimento.</p>
      <Link to="/" className="mt-6 inline-block bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
        Voltar para o Início
      </Link>
    </div>
  );
}
