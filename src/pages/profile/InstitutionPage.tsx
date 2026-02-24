import { useState } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EventInstitution, UserProfile } from '@/src/types';

export default function InstitutionPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [instituicao, setInstituicao] = useState<EventInstitution | ''>(user?.instituicao || '');
  const [campus, setCampus] = useState(user?.campus || '');
  const [perfil, setPerfil] = useState<UserProfile | ''>(user?.perfil || '');
  const [matricula, setMatricula] = useState(user?.matricula || '');
  const [siape, setSiape] = useState(user?.siape || '');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call for institutional linkage
    setTimeout(() => {
      // updateUser({ 
      //   instituicao: instituicao as EventInstitution,
      //   campus,
      //   perfil: perfil as UserProfile,
      //   matricula,
      //   siape,
      //   status: 'ativo_vinculado'
      // }); // TODO: Implementar com Supabase
      addNotification({
        titulo: 'Vínculo Institucional Confirmado',
        mensagem: 'Seu vínculo com a instituição foi confirmado com sucesso!',
        tipo: 'sistema',
      });
      setIsLoading(false);
      alert('Vínculo confirmado com sucesso! (Modo de Teste)');
      navigate('/perfil');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Instituição e Campus</h1>
        <p className='text-gray-500 mt-1'>Confirme seu vínculo para ter acesso a mais funcionalidades.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Form fields for institution, campus, profile, matricula, siape */}
          <div className='flex gap-4'>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              {isLoading ? 'Confirmando...' : 'Confirmar Vínculo'}
            </button>
            <button type="button" onClick={() => navigate('/perfil')} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
