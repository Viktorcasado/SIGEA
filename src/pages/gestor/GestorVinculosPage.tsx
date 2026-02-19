import { useEffect, useState } from 'react';
import { Vinculo, VinculoStatus } from '@/src/types';
import { VinculoRepositoryMock } from '@/src/repositories/VinculoRepository';
import { Check, X } from 'lucide-react';

const StatusBadge = ({ status }: { status: VinculoStatus }) => {
    const styles = {
        pendente: 'bg-yellow-100 text-yellow-800',
        aprovado: 'bg-green-100 text-green-800',
        rejeitado: 'bg-red-100 text-red-800',
    };
    const text = {
        pendente: 'Pendente',
        aprovado: 'Aprovado',
        rejeitado: 'Rejeitado',
    }
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>
}

export default function GestorVinculosPage() {
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    VinculoRepositoryMock.listByStatus('pendente').then(data => {
      setVinculos(data);
      setIsLoading(false);
    });
  }, []);

  const handleUpdateStatus = (vinculoId: string, status: VinculoStatus) => {
    // Em uma app real, você pode querer um modal de confirmação ou para adicionar um motivo de rejeição
    VinculoRepositoryMock.updateStatus(vinculoId, status).then(() => {
        setVinculos(vinculos.filter(v => v.id !== vinculoId));
        alert(`Vínculo ${status === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso!`);
    });
  };

  if (isLoading) return <div>Carregando vínculos...</div>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Aprovação de Vínculos</h1>
        <p className="text-gray-600 mt-1">Analise e aprove as solicitações de vínculo institucional.</p>
      </header>

      {vinculos.length === 0 ? (
        <p>Nenhuma solicitação de vínculo pendente.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vinculos.map(vinculo => (
                <tr key={vinculo.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{vinculo.userNome}</div>
                      <div className="text-sm text-gray-500">{vinculo.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{vinculo.perfilSolicitado} - {vinculo.instituicao}</div>
                      <div>Matrícula/SIAPE: {vinculo.matriculaOuSiape}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vinculo.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleUpdateStatus(vinculo.id, 'aprovado')} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 mr-2">
                        <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleUpdateStatus(vinculo.id, 'rejeitado')} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200">
                        <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
