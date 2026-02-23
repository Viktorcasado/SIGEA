"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, GraduationCap, MapPin, Save, Loader2 } from 'lucide-react';
import { UserProfile } from '@/src/types';

export default function InstitutionalLinkPage() {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  
  const [instituicao, setInstituicao] = useState('IFAL');
  const [vinculo, setVinculo] = useState<UserProfile>('aluno');
  const [campus, setCampus] = useState('');
  const [matricula, setMatricula] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setVinculo(user.perfil || 'aluno');
      setCampus(user.campus || '');
      setMatricula(user.matricula || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        perfil: vinculo,
        campus: campus,
        matricula: matricula
      });
      
      alert('Vínculo atualizado com sucesso!');
      navigate('/perfil');
    } catch (error: any) {
      console.error("[InstitutionalLink] Erro ao salvar:", error);
      alert('Erro ao salvar os dados. Tente novamente.');
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
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vínculo Institucional</h1>
            <p className="text-gray-500 text-sm">Informe seus dados acadêmicos ou profissionais.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Instituição</label>
              <select 
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="IFAL">IFAL</option>
                <option value="UFAL">UFAL</option>
                <option value="UNCISAL">UNCISAL</option>
                <option value="OUTRA">Outra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Vínculo</label>
              <select 
                value={vinculo}
                onChange={(e) => setVinculo(e.target.value as UserProfile)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="aluno">Aluno</option>
                <option value="servidor">Servidor</option>
                <option value="comunidade_externa">Comunidade Externa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Campus / Unidade</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                placeholder="Ex: Maceió"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Matrícula / SIAPE</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Seu número de identificação"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/perfil')}
              className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:bg-indigo-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Vínculo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}