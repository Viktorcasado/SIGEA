import { PlusCircle, ShieldCheck, FileBarChart, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const KpiCard = ({ title, value, change }: { title: string; value: string; change?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    {change && <p className="text-sm text-green-600 mt-1">{change}</p>}
  </div>
);

export default function PainelPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Painel do Gestor</h1>
        <p className="text-gray-600 mt-1">Visão geral da sua instituição.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Eventos Publicados" value="12" change="+2 este mês" />
        <KpiCard title="Inscrições" value="1,284" change="+15%" />
        <KpiCard title="Vínculos Pendentes" value="8" />
        <KpiCard title="Certificados Emitidos" value="732" />
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/evento/criar" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:bg-gray-50">
            <PlusCircle className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold text-gray-700">Criar Evento</span>
          </Link>
          <Link to="/gestor/vinculos" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:bg-gray-50">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold text-gray-700">Aprovar Vínculos</span>
          </Link>
          <Link to="/gestor/relatorios" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:bg-gray-50">
            <FileBarChart className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold text-gray-700">Relatórios</span>
          </Link>
          <Link to="/gestor/auditoria" className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:bg-gray-50">
            <History className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold text-gray-700">Auditoria</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
