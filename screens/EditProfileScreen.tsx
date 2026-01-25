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

  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setCampus(user.campus || 'Maceió (IFAL)');
      setUserType(user.user_type || 'aluno');
      setRegistrationNumber(user.registration_number || '');
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [user, previewUrl]);

  const campuses = [
    "Arapiraca (IFAL)",
    "Arapiraca (UFAL)",
    "Batalha (IFAL)",
    "Coruripe (IFAL)",
    "Delmiro Gouveia (UFAL)",
    "Maceió (IFAL)",
    "Maceió - A.C. Simões (UFAL)",
    "Maragogi (IFAL)",
    "Marechal Deodoro (IFAL)",
    "Murici (IFAL)",
    "Palmeira dos Índios (IFAL)",
    "Penedo (IFAL)",
    "Piranhas (IFAL)",
    "Rio Largo (IFAL)",
    "Santana do Ipanema (IFAL)",
    "São Miguel dos Campos (IFAL)",
    "Satuba (IFAL)",
    "Viçosa (IFAL)"
  ].sort((a, b) => a.localeCompare(b));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setShowError(false);
    if (!user) {
      setShowError("Sessão inválida. Por favor, faça login novamente.");
      return;
    }
    if (!name.trim()) {
      setShowError("O campo Nome não pode estar vazio.");
      return;
    }
    
    if ((userType === 'aluno' || userType === 'servidor') && !registrationNumber.trim()) {
      const fieldName = userType === 'aluno' ? 'Número de Matrícula' : 'SIAPE';
      setShowError(`O campo "${fieldName}" não pode estar vazio.`);
      return;
    }

    setIsSaving(true);
    
    // The current avatar URL in the context might already have a cache-buster.
    // We get the clean URL before proceeding.
    let newAvatarUrl = user?.avatar_url?.split('?')[0] || null;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        // The path is stable, so overwriting is possible.
        const filePath = `${user.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        newAvatarUrl = urlData.publicUrl; // This is the clean URL.
      }

      const finalRegistrationNumber = (userType === 'aluno' || userType === 'servidor') ? registrationNumber.trim() : '';

      const updates = { 
        id: user.id,
        full_name: name.trim(), 
        campus: campus,
        // Always save the clean URL to the database.
        avatar_url: newAvatarUrl,
        user_type: userType, 
        registration_number: finalRegistrationNumber,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase.from('profiles').upsert(updates);
      if (upsertError) throw upsertError;
      
      // Update the context with a freshly cache-busted URL for immediate UI feedback.
      updateUserContext({ 
        full_name: name.trim(), 
        campus: campus, 
        avatar_url: newAvatarUrl ? `${newAvatarUrl}?v=${Date.now()}` : null,
        user_type: userType,
        registration_number: finalRegistrationNumber
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onBack();
      }, 2000);

    } catch (error: any) {
      let errorMessage = `LOG TÉCNICO: ${error.message}`;
      console.error("--- ERRO AO SALVAR PERFIL ---", error);
      setShowError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  
  const currentAvatarSrc = previewUrl || user?.avatar_url;
  const registrationLabel = userType === 'aluno' ? 'Número de Matrícula' : 'SIAPE';

  return (
    <div className="h-screen flex flex-col">
      <PageHeader title="Editar Perfil" onBack={onBack} />
      
      {isSaving && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 relative overflow-hidden">
            <div className="w-full h-full bg-ifal-green absolute left-0 animate-pulse"></div>
        </div>
      )}

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                {currentAvatarSrc ? (
                    <img 
                      src={currentAvatarSrc} 
                      alt="Profile"
                      className="w-28 h-28 rounded-full border-4 border-ifal-green object-cover bg-gray-300"
                    />
                ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-ifal-green bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Icon name="user" className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                )}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-9 h-9 bg-ifal-green rounded-full flex items-center justify-center text-white border-2 border-white dark:border-gray-800"
                    aria-label="Alterar Foto"
                >
                    <Icon name="camera" className="w-5 h-5"/>
                </button>
            </div>
        </div>
        
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden"
            accept="image/png, image/jpeg"
        />

        <div className="space-y-4">
            <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                <input 
                    type="text" 
                    id="full-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-gray-400 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-ifal-green"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vínculo</label>
                <div className="flex w-full bg-gray-200 dark:bg-gray-800 rounded-xl p-1 space-x-1">
                    <button 
                        onClick={() => setUserType('aluno')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${userType === 'aluno' ? 'bg-white dark:bg-gray-900 text-ifal-green' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                        Aluno
                    </button>
                    <button 
                        onClick={() => setUserType('servidor')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${userType === 'servidor' ? 'bg-white dark:bg-gray-900 text-ifal-green' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                        Servidor
                    </button>
                     <button 
                        onClick={() => setUserType('externo')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${userType === 'externo' ? 'bg-white dark:bg-gray-900 text-ifal-green' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                        Externo
                    </button>
                </div>
            </div>

            {(userType === 'aluno' || userType === 'servidor') && (
                <div>
                    <label htmlFor="registration-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{registrationLabel}</label>
                    <input 
                        type="number" 
                        id="registration-number"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        inputMode="numeric"
                        className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-gray-400 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-ifal-green"
                    />
                </div>
            )}

             <div>
                <label htmlFor="campus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campus</label>
                <select 
                    id="campus"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-gray-400 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-ifal-green appearance-none"
                >
                    {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>
        
        {showError && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative text-sm" role="alert">
                <strong className="font-semibold block mb-1">Falha ao Salvar</strong>
                <span className="block">{showError}</span>
            </div>
        )}

        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-ifal-green text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center disabled:bg-emerald-700 disabled:cursor-not-allowed"
        >
            {isSaving ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                </>
            ) : ( 'Salvar Alterações' )}
        </button>
      </main>

      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-ifal-green text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          Perfil SIGEA Atualizado!
      </div>
      
    </div>
  );
};

export default EditProfileScreen;