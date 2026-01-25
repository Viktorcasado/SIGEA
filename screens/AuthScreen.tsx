import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F7] dark:bg-[#121212] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
            {isLogin ? 'Acessar Conta' : 'Criar Nova Conta'}
          </h2>
          
          <form onSubmit={handleAuthAction} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-ifal-green"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail Institucional</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu.email@aluno.ifal.edu.br"
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-ifal-green"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-ifal-green"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {message && <p className="text-green-500 text-sm text-center">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ifal-green text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center disabled:bg-emerald-700"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : ( isLogin ? 'Entrar' : 'Criar Conta' )}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-sm font-medium text-ifal-green hover:underline"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;