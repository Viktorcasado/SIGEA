import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

interface AuthScreenProps {
  initialView?: 'login' | 'register';
  onBack?: () => void;
  onForgotPassword?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ initialView = 'login', onBack, onForgotPassword }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsLogin(initialView === 'login');
  }, [initialView]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: 'https://sigea-projeto.vercel.app',
          },
        });
        if (error) throw error;
        setMessage('Cadastro realizado! Verifique seu e-mail institucional.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F7] dark:bg-[#000000] animate-fade-in font-sans">
      {/* Cupertino Navigation Bar */}
      <header className="sticky top-0 z-20 h-11 flex items-center justify-center bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        {onBack && (
            <div className="absolute left-2">
                <button onClick={onBack} className="p-2 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-500/10 active:bg-gray-500/20">
                    <Icon name="arrow-left" className="w-6 h-6" />
                </button>
            </div>
        )}
        <h1 className="text-[17px] font-semibold text-gray-900 dark:text-white">
          {isLogin ? 'Entrar no SIGEA' : 'Criar Conta'}
        </h1>
      </header>

      <main className="flex-grow flex flex-col px-8 pt-12">
        <div className="flex justify-center mb-10">
          <Logo className="w-28 h-28" />
        </div>

        <form onSubmit={handleAuthAction} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="user" className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nome Completo"
                className="w-full bg-gray-200/60 dark:bg-[#1C1C1E] text-gray-900 dark:text-white rounded-[12px] py-4 pl-12 pr-4 text-[16px] focus:outline-none focus:ring-2 focus:ring-ifal-green transition-all"
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="person_circle" className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-mail institucional"
              className="w-full bg-gray-200/60 dark:bg-[#1C1C1E] text-gray-900 dark:text-white rounded-[12px] py-4 pl-12 pr-4 text-[16px] focus:outline-none focus:ring-2 focus:ring-ifal-green transition-all"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="shield" className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Sua senha"
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ifal-green text-white font-bold py-4 rounded-[12px] shadow-lg shadow-ifal-green/20 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? 'Entrar' : 'Cadastrar'
              )}
            </button>
          </div>

          {isLogin && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="w-full text-center text-ifal-green text-[14px] font-medium py-2 active:opacity-50"
            >
              Esqueceu a senha?
            </button>
          )}
        </form>

        <div className="flex-grow" />

        <footer className="pb-10 pt-4 flex justify-center items-center">
          <span className="text-gray-500 dark:text-gray-400 text-[15px]">
            {isLogin ? 'Não tem conta?' : 'Já tem uma conta?'}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            className="ml-1.5 text-ifal-green font-bold text-[15px] active:opacity-50"
          >
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </footer>
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

export default AuthScreen;