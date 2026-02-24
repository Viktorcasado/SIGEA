import { useState, useEffect } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import { supabaseError } from '@/src/services/supabase';
import { ArrowRight, Wifi, Power } from 'lucide-react';

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
      navigate('/');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <div className="inline-block p-3 bg-gray-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-500 mt-2">To sign in to an account in the application, enter your email and password</p>
        </header>

        {supabaseError && (
          <div className="p-3 mb-4 text-sm text-center font-medium text-red-700 bg-red-100 rounded-lg">
            <strong>Erro de Configuração:</strong> {supabaseError}
          </div>
        )}
        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-mail"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="relative">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={isLoading || !!supabaseError} className="w-full px-4 py-3 font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-colors">
            {isLoading ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6">
          Don't have an account yet? <Link to="/register" className="font-medium text-teal-600 hover:underline">Create an account</Link>
        </div>

        <div className="relative flex items-center justify-center w-full my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
        </div>

        <div className="space-y-3">
            {/* Apple Sign In Button - Placeholder */}
            <button disabled={isLoading || !!supabaseError} className="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-70 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.256 13.533c-.043.01-.085.021-.129.031-.131.031-.264.061-.398.088-.18.037-.362.07-.546.097-.182.027-.366.048-.55.063-.285.024-.573.036-.864.036-.398 0-.79-.02-1.171-.059-.283-.03-.563-.067-.837-.111-.264-.043-.524-.093-.778-.15-.244-.054-.484-.114-.718-.182-.29-.084-.57-.183-.837-.298-.32-.132-.62-.293-.9-.482-.268-.182-.515-.39-.737-.622-.21-.223-.393-.47-.546-.737-.14-.254-.25-.524-.326-.808-.07-.268-.113-.542-.128-.82-.016-.285-.016-.57-.016-.855s0-.57.016-.855c.015-.278.058-.552.128-.82.076-.284.185-.554.326-.808.153-.267.336-.514.546-.737.222-.232.47-.44.737-.622.28-.19.58-.35.9-.482.267-.115.547-.214.837-.298.234-.068.474-.128.718-.182.254-.057.514-.107.778-.15.274-.044.554-.081.837-.111.38-.04.773-.06 1.17-.06.29 0 .58.012.864.036.184.015.368.036.55.063.184.027.366.06.546.097.134.027.267.057.398.088.044.01.086.022.13.031.145.034.288.07.43.108.17.045.336.095.5.15.14.048.276.1.408.156.255.108.492.23.71.365.22.135.42.288.6.458.17.16.315.336.435.525.115.18.202.375.26.585.05.175.085.355.105.54.035.315.035.635.035.96s0 .645-.035.96c-.02.185-.055.365-.105.54-.058.21-.145.405-.26.585-.12.19-.265.365-.435.525-.18.17-.38.323-.6.458-.218.135-.455.257-.71.365-.132.056-.268.108-.408.156-.164.055-.33.105-.5.15zM9.07 19.166c.21.21.435.4.675.57.27.195.555.36.855.5.325.15.665.27 1.02.36.36.09.73.15 1.11.18.38.03.765.03 1.155.03.39 0 .775 0 1.155-.03.38-.03.75-.09 1.11-.18.355-.09.695-.21 1.02-.36.3-.14.585-.305.855-.5.24-.17.465-.36.675-.57.23-.225.43-.48.6-.765.16-.27.285-.565.375-.88.085-.305.14-.62.16-.945.02-.325.02-.655.02-.99s0-.665-.02-.99c-.02-.325-.075-.64-.16-.945-.09-.315-.215-.61-.375-.88-.17-.285-.37-.54-.6-.765-.21-.21-.435-.4-.675-.57-.27-.195-.555-.36-.855-.5-.325-.15-.665-.27-1.02-.36-.36-.09-.73-.15-1.11-.18-.38-.03-.765-.03-1.155-.03-.39 0-.775 0-1.155.03-.38.03-.75-.09-1.11-.18-.355-.09-.695-.21-1.02-.36-.3-.14-.585-.305-.855-.5-.24-.17-.465-.36-.675-.57-.23-.225-.43-.48-.6-.765-.16-.27-.285-.565-.375-.88-.085-.305-.14-.62-.16-.945-.02-.325-.02-.655-.02-.99s0-.665.02-.99c.02-.325.075-.64.16-.945.09-.315.215-.61.375-.88.17-.285.37-.54.6-.765.21-.21.435-.4.675-.57.27-.195.555-.36.855-.5.325-.15.665-.27-1.02-.36-.36-.09-.73-.15-1.11-.18-.38-.03-.765-.03-1.155.03h-.03c-1.545 0-3.015.345-4.305 1.005-1.245.63-2.31 1.5-3.165 2.58-.87 1.095-1.515 2.385-1.89 3.81-.375 1.425-.525 2.91-.495 4.41.03 1.5.225 2.97.63 4.38.405 1.41.99 2.715 1.755 3.885.765 1.17 1.695 2.19 2.775 3.015.705.525 1.47.96 2.295 1.29.81.33 1.68.54 2.58.63.435.045.87.06 1.305.06s.87-.015 1.305-.06z"/></svg>
                <span>Sign in with Apple</span>
            </button>
            <button 
                onClick={handleGoogleLogin} 
                disabled={isLoading || !!supabaseError} 
                className="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-70 transition-colors"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.59L5.84 9.43c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
            </button>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-8">
          By clicking "Continue", I have read and agree with the <Link to="/sistema/termos" className="underline">Term Sheet</Link>, <Link to="/sistema/politicas" className="underline">Privacy Policy</Link>
        </footer>
      </div>
    </div>
  );
}
