import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PoliciesPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>
      <div className="bg-white p-6 rounded-2xl shadow-lg prose">
        <h1>Políticas de Privacidade</h1>
        <p>Última atualização: 18 de Fevereiro de 2026</p>
        <p>A sua privacidade é importante para nós. É política do SIGEA respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site SIGEA, e outros sites que possuímos e operamos.</p>
        <p>Trabalhamos com base na Lei de Proteção de Dados (13.709/2018), que traz garantias explícitas sobre seus direitos fundamentais de liberdade e de privacidade e o livre desenvolvimento da personalidade da pessoa natural.</p>
      </div>
    </div>
  );
}
