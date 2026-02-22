import { useState, useEffect } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, session, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  // Redireciona se já estiver logado
  useEffect(() => {
    if (!loading && session) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [session, loading, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      // O redirecionamento será feito pelo useEffect acima
    } catch (err: any) {
      console.error("Erro no login:", err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Erro ao tentar entrar. Verifique sua conexão.');
      }
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError('Erro ao tentar login com o Google.');
      setIsLoading(false);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900">Entrar</h1>
          <p className="text-gray-500 mt-2">Acesse sua conta para gerenciar eventos.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Sua senha"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" title="Recuperar Senha" className="text-sm font-bold text-indigo-600 hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-indigo-300 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative px-4 bg-white text-xs font-black text-gray-400 uppercase">ou</div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoading} 
          className="w-full flex items-center justify-center gap-3 px-4 py-4 font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>

        <div className="text-center text-sm text-gray-500 mt-8">
          Ainda não tem conta?{' '}
          <Link to="/register" className="font-black text-indigo-600 hover:underline">
            Criar primeiro acesso
          </Link>
        </div>
      </div>
    </div>
  );
}