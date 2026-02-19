import React from 'react';

export default function GestorRelatoriosPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">Exporte dados consolidados sobre eventos e participação.</p>
      </header>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gerar Relatório</h2>
        <p className="text-gray-600">Funcionalidade de relatórios em desenvolvimento. Em breve, você poderá gerar relatórios detalhados de inscrições, presença e certificados emitidos.</p>
        {/* Placeholder for report generation form */}
      </div>
    </div>
  );
}
