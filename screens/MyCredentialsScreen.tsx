import React from 'react';
import PageHeader from '../components/PageHeader';
import { useUser } from '../contexts/UserContext';
import QrCodeGenerator from '../components/QrCodeGenerator';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

interface MyCredentialsScreenProps {
  onBack: () => void;
}

const MyCredentialsScreen: React.FC<MyCredentialsScreenProps> = ({ onBack }) => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans pb-10">
      <PageHeader title="Minha Credencial" onBack={onBack} />
      
      <main className="container max-w-sm mx-auto px-6 pt-12 animate-fade-in">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden shadow-2xl border border-black/5 flex flex-col items-center">
            {/* Cabeçalho da Credencial */}
            <div className="w-full bg-[#2e7d32] p-8 flex flex-col items-center text-center">
                <Logo className="h-10 brightness-200 grayscale opacity-80 mb-6" />
                <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 mb-4">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Icon name="user" className="w-12 h-12 text-white/50" />
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-black text-white leading-tight">{user.full_name}</h2>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mt-1">
                    {user.user_type || 'Participante'} • IFAL
                </p>
            </div>

            {/* Corpo do QR Code */}
            <div className="p-10 flex flex-col items-center">
                <div className="p-4 bg-white rounded-3xl shadow-inner border-4 border-[#F2F2F7]">
                    <QrCodeGenerator 
                        url={user.id} 
                        size={220} 
                        dotsColorOverride="#2e7d32"
                    />
                </div>
                
                <div className="mt-8 text-center space-y-2">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                        Apresente este código no<br/>momento do credenciamento
                    </p>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Icon name="shield" className="w-3 h-3 text-[#2e7d32]" />
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                            ID: {user.id.substring(0, 13).toUpperCase()}...
                        </span>
                    </div>
                </div>
            </div>

            {/* Rodapé institucional */}
            <div className="w-full p-4 border-t border-black/5 bg-gray-50 dark:bg-black/20 text-center">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    SIGEA — Sistema Integrado de Gestão de Eventos Acadêmicos
                </p>
            </div>
        </div>

        <button 
            onClick={() => window.print()}
            className="w-full mt-8 flex items-center justify-center space-x-2 text-gray-500 hover:text-[#2e7d32] transition-colors"
        >
            <Icon name="arrows-outward" className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Salvar como imagem</span>
        </button>
      </main>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default MyCredentialsScreen;