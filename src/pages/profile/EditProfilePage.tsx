"use client";

import { useState, useRef } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Image as ImageIcon, Upload, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/src/integrations/supabase/client';

export default function EditProfilePage() {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [nome, setNome] = useState(user?.nome || '');
  const [nomeCertificado, setNomeCertificado] = useState(user?.nome_certificado || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError('Erro ao subir imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !nomeCertificado) {
      setError('O nome de exibição e o nome do certificado são obrigatórios.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await updateProfile({ 
        nome, 
        nome_certificado: nomeCertificado, 
        telefone, 
        avatar_url: avatarUrl 
      });
      alert('Perfil atualizado com sucesso!');
      navigate('/perfil');
    } catch (err: any) {
      setError('Erro ao atualizar perfil. Tente novamente.');
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
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
            <p className="text-gray-500 text-sm">Mantenha seus dados sempre atualizados.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50 shadow-md transition-opacity group-hover:opacity-75"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-4 border-dashed border-gray-200 group-hover:border-indigo-300 transition-colors">
                  <User className="w-16 h-16" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/40 p-2 rounded-full text-white">
                  <Upload className="w-6 h-6" />
                </div>
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <p className="text-xs text-gray-400 mt-3 font-medium">Clique na imagem para alterar sua foto</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome de Exibição (App)</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="Como quer ser chamado no app"
              />
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-2">
                <FileText className="w-4 h-4" />
                Nome Completo (Para Certificados)
              </label>
              <input 
                type="text" 
                value={nomeCertificado} 
                onChange={(e) => setNomeCertificado(e.target.value)} 
                required 
                className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Seu nome completo oficial"
              />
              <p className="text-[10px] text-indigo-600 mt-2 font-medium">Este nome será impresso em todos os seus certificados digitais.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
            <input 
              type="tel" 
              value={telefone} 
              onChange={(e) => setTelefone(e.target.value)} 
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
              {error}
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
              disabled={isLoading || isUploading} 
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:bg-indigo-300"
            >
              {isLoading ? 'Salvando...' : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}