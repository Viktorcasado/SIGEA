import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Logo from '../components/Logo';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        alert("Cadastro realizado! Verifique seu e-mail para confirmar.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 lg:p-12 shadow-2xl shadow-gray-200 border border-gray-100 animate-scale-up">
        <div className="text-center mb-10">
          <Logo className="h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-gray-500 font-medium mt-2">Portal Acadêmico Integrado</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2e7d32] transition-colors" size={20} />
              <input
                type="text"
                placeholder="Nome Completo"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#2e7d32] outline-none transition-all font-medium text-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2e7d32] transition-colors" size={20} />
            <input
              type="email"
              placeholder="E-mail Institucional"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#2e7d32] outline-none transition-all font-medium text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2e7d32] transition-colors" size={20} />
            <input
              type="password"
              placeholder="Sua senha"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#2e7d32] outline-none transition-all font-medium text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-500 text-xs font-bold px-2 animate-shake">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2e7d32] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 font-bold text-sm hover:text-[#2e7d32] transition-colors underline underline-offset-4"
          >
            {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já possui conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;