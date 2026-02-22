"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const { user, loading, login, loginWithGoogle } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redireciona apenas quando o carregamento terminar e o usuário existir
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || "/";
      // Evita redirecionar para o próprio login
      const target = from === '/login' ? '/' : from;
      navigate(target, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      // O redirecionamento é tratado pelo useEffect acima
    } catch (err: any) {
      setError('E-mail ou senha incorretos.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <h1 className="text-3xl font-black text-gray-900">Entrar</h1>
          <p className="text-gray-500 mt-2 font-medium">Acesse sua conta SIGEA</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-indigo-300 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">ou</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <button
          onClick={() => loginWithGoogle()}
          className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 font-medium">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-indigo-600 font-black hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}