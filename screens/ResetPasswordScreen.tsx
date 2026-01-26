import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';

interface ResetPasswordScreenProps {
  onBack: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://sigea-projeto.vercel.app/',
    });

    setLoading(false);
    if (resetError) {
      setError('Não foi possível enviar o link. Verifique o e-mail ou tente novamente.');
      console.error('Reset password error:', resetError);
    } else {
      setMessage('Link enviado! Verifique sua caixa de entrada para redefinir sua senha.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F7] dark:bg-[#000000] animate-fade-in font-sans">
      <header className="sticky top-0 z-20 h-11 flex items-center justify-center bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="absolute left-2">
            <button onClick={onBack} className="p-2 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-500/10 active:bg-gray-500/20">
                <Icon name="arrow-left" className="w-6 h-6" />
            </button>
        </div>
        <h1 className="text-[17px] font-semibold text-gray-900 dark:text-white">
          Recuperar Senha
        </h1>
      </header>
      
      <main className="flex-grow flex flex-col items-center px-8 pt-20">
        <Icon name="lock-closed" className="w-20 h-20 text-gray-400 dark:text-gray-500 mb-6" />
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-sm mb-8">
          Insira seu e-mail para receber um link de redefinição de senha.
        </p>

        <form onSubmit={handleSendLink} className="w-full max-w-sm space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="person_circle" className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Seu e-mail cadastrado"
                className="w-full bg-gray-200/60 dark:bg-[#1C1C1E] text-gray-900 dark:text-white rounded-[12px] py-4 pl-12 pr-4 text-[16px] focus:outline-none focus:ring-2 focus:ring-ifal-green transition-all"
              />
            </div>

            {error && (
              <p className="text-[#FF3B30] text-sm text-center font-medium animate-shake">
                {error}
              </p>
            )}
            
            {message && (
              <p className="text-ifal-green text-sm text-center font-semibold">
                {message}
              </p>
            )}

            <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !!message}
                  className="w-full bg-ifal-green text-white font-bold py-4 rounded-[12px] shadow-lg shadow-ifal-green/20 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Enviar Link'
                  )}
                </button>
            </div>
        </form>
      </main>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
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

export default ResetPasswordScreen;
