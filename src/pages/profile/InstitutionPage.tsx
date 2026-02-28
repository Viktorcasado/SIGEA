import { useState } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { updateProfile } from '@/src/services/profileService';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, GraduationCap, MapPin, ShieldCheck } from 'lucide-react';
import { EventInstitution, UserProfile } from '@/src/types';

export default function InstitutionPage() {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [instituicao, setInstituicao] = useState<EventInstitution | ''>(user?.instituicao || 'IFAL');
  const [campus, setCampus] = useState(user?.campus || '');
  const [perfil, setPerfil] = useState<UserProfile | ''>(user?.perfil || 'aluno');
  const [matricula, setMatricula] = useState(user?.matricula || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await updateProfile(user.id, { 
        campus,
        perfil: perfil as UserProfile,
        matricula,
      });
      
      await refreshUser();
      
      addNotification({
        titulo: 'Vínculo Atualizado',
        mensagem: 'Suas informações institucionais foram salvas com sucesso.',
        tipo: 'sistema',
      });
      
      alert('Vínculo atualizado com sucesso! Suas permissões foram atualizadas.');
      navigate('/perfil');
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar vínculo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-bold mb-8 group">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
        </div>
        Voltar para o Perfil
      </Link>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vínculo Institucional</h1>
        <p className='text-gray-500 font-medium mt-1'>Mantenha seus dados acadêmicos atualizados para acessar áreas restritas.</p>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Instituição</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  value={instituicao} 
                  onChange={(e) => setInstituicao(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                >
                  <option value="IFAL">IFAL - Inst. Federal de Alagoas</option>
                  <option value="UFAL">UFAL - Univ. Federal de Alagoas</option>
                  <option value="Outra">Outra Instituição</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Campus</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={campus} 
                  onChange={(e) => setCampus(e.target.value)}
                  placeholder="Ex: Maceió, Arapiraca..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Perfil</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select 
                    value={perfil} 
                    onChange={(e) => setPerfil(e.target.value as UserProfile)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                  >
                    <option value="aluno">Aluno</option>
                    <option value="servidor">Servidor</option>
                    <option value="comunidade_externa">Comunidade Externa</option>
                    <option value="gestor">Gestor (Acesso Total)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Matrícula / SIAPE</label>
                <input 
                  type="text" 
                  value={matricula} 
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Número do registro"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5" />
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
              <strong>Dica:</strong> Para acessar o Painel do Gestor ou criar eventos, altere seu perfil para <strong>Gestor</strong> ou <strong>Servidor</strong>.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 pt-4'>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:bg-gray-300"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/perfil')} 
              className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}