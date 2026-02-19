import { useState } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useUser();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/'); // O onAuthStateChange cuidará do redirecionamento
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Sem conexão. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError('Ocorreu um erro ao tentar login com o Google.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          {/* <img src="/sigea-logo.svg" alt="Logo SIGEA" className="w-24 h-24 mx-auto mb-4" /> */}
          <h1 className="text-3xl font-bold text-gray-900">Entrar</h1>
          <p className="text-gray-600 mt-2">Acesse para se inscrever e emitir certificados.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className='relative'>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Esqueci minha senha</Link>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button type="submit" disabled={isLoading} className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <div className="relative flex items-center justify-center my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative px-2 bg-white text-sm text-gray-500">ou</div>
        </div>
        <div className="space-y-3">
            <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors">
                {/* <img src="/google-logo.svg" alt="Google" className="w-5 h-5" /> */}
                <span>Entrar com Google</span>
            </button>
            <Link to="/login-govbr" className="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors">
                {/* <img src="/govbr-logo.svg" alt="Gov.br" className="w-5 h-5" /> */}
                <span>Acessar com gov.br</span>
            </Link>
        </div>
        <div className="text-center text-sm text-gray-600 mt-6">
            Ainda não tem conta? <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Criar primeiro acesso</Link>
        </div>
      </div>
    </div>
  );
}
