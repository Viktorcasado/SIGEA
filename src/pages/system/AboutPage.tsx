import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>
      <div className="bg-white p-6 rounded-2xl shadow-lg prose">
        <h1>Sobre o SIGEA</h1>
        <p>Versão 1.0.0 (Build de Desenvolvimento)</p>
        <p>O Sistema Integrado de Gestão de Eventos Acadêmicos (SIGEA) é uma plataforma unificada para a gestão completa de eventos acadêmicos, desde a criação e inscrição até a emissão e validação de certificados digitais.</p>
        <p>Desenvolvido para atender às necessidades de instituições como IFAL e UFAL, bem como da comunidade externa, o SIGEA visa simplificar processos e centralizar informações.</p>
      </div>
    </div>
  );
}
