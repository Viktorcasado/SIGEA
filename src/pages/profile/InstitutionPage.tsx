"use client";

import { useState } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, GraduationCap } from 'lucide-center';
import { Building2 as BuildingIcon, GraduationCap as GradIcon } from 'lucide-react';
import { EventInstitution, UserProfile } from '@/src/types';

export default function InstitutionPage() {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [instituicao, setInstituicao] = useState<EventInstitution>(user?.instituicao || 'IFAL');
  const [campus, setCampus] = useState(user?.campus || '');
  const [perfil, setPerfil] = useState<UserProfile>(user?.perfil || 'aluno');
  const [matricula, setMatricula] = useState(user?.matricula || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Se for servidor, ganha status de organizador automaticamente para fins de demonstração
      const isOrganizer = perfil === 'servidor' || perfil === 'gestor';

      await updateProfile({ 
        instituicao,
        campus,
        perfil,
        matricula,
        is_organizer: isOrganizer,
        status: isOrganizer ? 'gestor' : 'ativo_vinculado'
      });

      addNotification({
        titulo: 'Vínculo Atualizado',
        mensagem: 'Seus dados institucionais foram salvos com sucesso.',
        tipo: 'vinculo',
      });
      
      alert('Vínculo atualizado com sucesso!');
      navigate('/perfil');
    } catch (error) {
      console.error('Erro ao atualizar vínculo:', error);
      alert('Erro ao atualizar vínculo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para o Perfil
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BuildingIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vínculo Institucional</h1>
            <p className="text-gray-500 text-sm">Informe seus dados acadêmicos ou profissionais.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Instituição</label>
            <select 
              value={instituicao} 
              onChange={(e) => setInstituicao(e.target.value as EventInstitution)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            >
              <option value="IFAL">IFAL</option>
              <option value="UFAL">UFAL</option>
              <option value="Comunidade">Outra / Comunidade</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Campus / Unidade</label>
            <input 
              type="text" 
              value={campus} 
              onChange={(e) => setCampus(e.target.value)} 
              placeholder="Ex: Maceió, Arapiraca..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Vínculo</label>
            <select 
              value={perfil} 
              onChange={(e) => setPerfil(e.target.value as UserProfile)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            >
              <option value="aluno">Aluno</option>
              <option value="servidor">Servidor (Docente/Técnico)</option>
              <option value="comunidade_externa">Comunidade Externa</option>
            </select>
          </div>

          {perfil !== 'comunidade_externa' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Matrícula ou SIAPE</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={matricula} 
                  onChange={(e) => setMatricula(e.target.value)} 
                  placeholder="Digite seu número de identificação"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
                <GradIcon className="absolute right-4 top-3.5 text-gray-400 w-5 h-5" />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/perfil')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-indigo-300"
            >
              {isLoading ? 'Salvando...' : 'Salvar Vínculo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}