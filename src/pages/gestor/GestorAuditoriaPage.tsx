import React from 'react';

export default function GestorAuditoriaPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Trilha de Auditoria</h1>
        <p className="text-gray-600 mt-1">Acompanhe as ações importantes realizadas no sistema.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Registros Recentes</h2>
        <p className="text-gray-600">A trilha de auditoria está sendo implementada e registrará ações como aprovação de vínculos, encerramento de eventos e emissão de certificados.</p>
        {/* Placeholder for audit log table */}
      </div>
    </div>
  );
}
