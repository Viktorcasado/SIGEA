import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../components/PageHeader';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';
import { UserType } from '../types';

interface EditProfileScreenProps {
  onBack: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { user, updateUserContext } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState("");
  const [campus, setCampus] = useState("Maceió (IFAL)");
  const [userType, setUserType] = useState<UserType>('aluno');
  const [registrationNumber, setRegistrationNumber] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | false>(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setCampus(user.campus || 'Maceió (IFAL)');
      setUserType(user.user_type || 'aluno');
      setRegistrationNumber(user.registration_number || '');
    }
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [user]);

  const campuses = [
    "Arapiraca (IFAL)", "Arapiraca (UFAL)", "Batalha (IFAL)", "Coruripe (IFAL)",
    "Delmiro Gouveia (UFAL)", "Maceió (IFAL)", "Maceió - A.C. Simões (UFAL)",
    "Maragogi (IFAL)", "Marechal Deodoro (IFAL)", "Murici (IFAL)",
    "Palmeira dos Índios (IFAL)", "Penedo (IFAL)", "Piranhas (IFAL)",
    "Rio Largo (IFAL)", "Santana do Ipanema (IFAL)", "São Miguel dos Campos (IFAL)",
    "Satuba (IFAL)", "Viçosa (IFAL)"
  ].sort((a, b) => a.localeCompare(b));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setShowError("A imagem deve ter no máximo 2MB.");
        return;
      }
      setSelectedFile(file);
      setIsRemovingPhoto(false);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setShowError(false);
    }
  };

  const handleRemovePhoto = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setSelectedFile(null);
    setIsRemovingPhoto(true);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    setShowError(false);
    if (!user) {
      setShowError("Sessão expirada. Refaça o login.");
      return;
    }
    if (!name.trim()) {
      setShowError("O nome é obrigatório.");
      return;
    }

    setIsSaving(true);
    
    // Lógica de URL do Avatar: 
    // Se isRemovingPhoto for true, vai para null.
    // Senão, mantém a atual (sem o query string de cache) ou aguarda o novo upload.
    let finalAvatarUrl = isRemovingPhoto ? null : (user?.avatar_url?.split('?')[0] || null);

    try {
      // 1. Upload de nova imagem se houver
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile, { 
            upsert: true,
            contentType: selectedFile.type 
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = urlData.publicUrl;
      }

      const finalRegNumber = (userType === 'aluno' || userType === 'servidor') ? registrationNumber.trim() : '';

      // 2. Sincronização com o Banco de Dados
      const updates = { 
        id: user.id,
        full_name: name.trim(), 
        campus: campus,
        avatar_url: finalAvatarUrl,
        user_type: userType, 
        registration_number: finalRegNumber,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase.from('profiles').upsert(updates);
      if (upsertError) throw upsertError;
      
      // 3. Atualização do Contexto
      updateUserContext({ 
        full_name: name.trim(), 
        campus: campus, 
        avatar_url: finalAvatarUrl ? `${finalAvatarUrl}?t=${Date.now()}` : null,
        user_type: userType,
        registration_number: finalRegNumber
      });

      if (navigator.vibrate) navigator.vibrate(50);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onBack();
      }, 1500);

    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      setShowError(`Erro técnico: ${error.message || 'Falha na conexão'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const currentAvatarSrc = isRemovingPhoto ? null : (previewUrl || user?.avatar_url);
  const registrationLabel = userType === 'aluno' ? 'Número de Matrícula' : 'SIAPE';

  return (
    <div className="h-screen flex flex-col bg-[#F2F2F7] dark:bg-black font-sans">
      <PageHeader title="Editar Perfil" onBack={onBack} />
      
      <main className="flex-grow p-6 space-y-8 overflow-y-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
            <div className="relative group">
                <div className={`w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-800 transition-all active:scale-95 ${isSaving ? 'opacity-50' : ''}`}>
                    {currentAvatarSrc ? (
                        <img 
                          src={currentAvatarSrc} 
                          alt="Profile"
                          className="w-full h-full object-cover animate-fade-in"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center animate-fade-in">
                            <Icon name="user" className="w-16 h-16 text-gray-400" />
                        </div>
                    )}
                    
                    {isSaving && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 border-4 border-ifal-green border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                </div>
                
                {/* Botão para Alterar (Câmera) */}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                    className="absolute bottom-1 right-1 w-10 h-10 bg-ifal-green rounded-full flex items-center justify-center text-white border-4 border-[#F2F2F7] dark:border-black shadow-lg active:scale-90 transition-all z-10"
                >
                    <Icon name="camera" className="w-5 h-5"/>
                </button>

                {/* Botão para Remover (Lixeira) - Visível apenas se houver foto */}
                {currentAvatarSrc && (
                  <button 
                      onClick={handleRemovePhoto}
                      disabled={isSaving}
                      className="absolute top-1 right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-red-500 border-2 border-[#F2F2F7] dark:border-black shadow-md active:scale-90 transition-all z-10"
                      title="Remover foto"
                  >
                      <Icon name="trash" className="w-4 h-4"/>
                  </button>
                )}
            </div>
            <p className="mt-4 text-[13px] font-bold text-gray-400 uppercase tracking-widest">
              {currentAvatarSrc ? 'Alterar ou remover foto' : 'Toque na câmera para adicionar'}
            </p>
        </div>
        
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden"
            accept="image/png, image/jpeg"
        />

        <div className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase ml-4 tracking-tighter">Nome Completo</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white rounded-[16px] p-4 border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-ifal-green/50 transition-all"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase ml-4 tracking-tighter">Vínculo Institucional</label>
                <div className="flex bg-gray-200 dark:bg-[#1C1C1E] rounded-[14px] p-1.5 space-x-1">
                    {(['aluno', 'servidor', 'externo'] as UserType[]).map(type => (
                        <button 
                            key={type}
                            onClick={() => setUserType(type)}
                            className={`flex-1 py-2.5 rounded-[10px] text-xs font-black uppercase tracking-widest transition-all ${userType === type ? 'bg-white dark:bg-gray-800 text-ifal-green shadow-md scale-[1.02]' : 'text-gray-500'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {(userType === 'aluno' || userType === 'servidor') && (
                <div className="space-y-1.5 animate-scale-up">
                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase ml-4 tracking-tighter">{registrationLabel}</label>
                    <input 
                        type="number" 
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder={userType === 'aluno' ? "Ex: 2024123456" : "Ex: 1234567"}
                        className="w-full bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white rounded-[16px] p-4 border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-ifal-green/50 transition-all"
                    />
                </div>
            )}

             <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase ml-4 tracking-tighter">Campus de Origem</label>
                <div className="relative">
                    <select 
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        className="w-full bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white rounded-[16px] p-4 border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-ifal-green/50 transition-all appearance-none"
                    >
                        {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <Icon name="chevron-right" className="w-5 h-5 rotate-90" />
                    </div>
                </div>
            </div>
        </div>
        
        {showError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-[16px] flex items-start space-x-3 animate-shake">
                <Icon name="life-buoy" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{showError}</p>
            </div>
        )}

        <div className="pt-4">
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-ifal-green text-white font-black py-4 rounded-[18px] shadow-xl shadow-ifal-green/30 active:scale-[0.97] transition-all flex items-center justify-center disabled:opacity-50"
            >
                {isSaving ? (
                    <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="uppercase tracking-widest text-[14px]">Sincronizando...</span>
                    </div>
                ) : ( 
                    <span className="uppercase tracking-widest text-[14px]">Salvar Alterações</span>
                )}
            </button>
        </div>
      </main>

      {/* Success Toast */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-ifal-green text-white px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl transition-all duration-500 z-50 flex items-center space-x-3 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <Icon name="check" className="w-5 h-5" />
          <span>Perfil Atualizado</span>
      </div>

      <style>{`
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default EditProfileScreen;