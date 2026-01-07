
import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import Logo from '../components/Logo.tsx';
import { CAMPUS_LIST } from '../constants.tsx';

interface LoginProps {
  onLogin: () => void;
  onGuestLogin?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  errorMsg?: string | null;
}

type AuthView = 'LANDING' | 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

const Login: React.FC<LoginProps> = ({ onLogin, onGuestLogin, darkMode, setDarkMode, errorMsg }) => {
  const [view, setView] = useState<AuthView>('LANDING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorMsg || null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);

  useEffect(() => {
    if (errorMsg) setError(errorMsg);
  }, [errorMsg]);

  const handleSocialLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'keycloak', 
        options: {
          redirectTo: window.location.origin,
          queryParams: { prompt: 'login' }
        }
      });
      if (oauthError) throw oauthError;
      if (data?.url) window.location.assign(data.url);
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (view === 'SIGN_IN') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onLogin();
      } else if (view === 'SIGN_UP') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, campus, role: 'PARTICIPANT' } }
        });
        if (signUpError) throw signUpError;
        
        if (data.user && data.session === null) {
          setMessage("Sucesso! Verifique seu e-mail institucional para confirmar o cadastro.");
        } else if (data.session) {
          onLogin();
        }
      }
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const changeView = (newView: AuthView) => {
    setError(null);
    setMessage(null);
    setView(newView);
  };

  const isNetworkIssue = error?.toLowerCase().includes('conexão') || error?.toLowerCase().includes('fetch');

  if (view === 'LANDING') {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-between p-10 transition-colors duration-700 ${darkMode ? 'bg-zinc-950' : 'bg-primary'}`}>
        <div className="h-12"></div>
        <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
          <Logo dark size="huge" className="mb-8 drop-shadow-2xl" />
          <p className={`text-[11px] font-black px-8 uppercase tracking-[0.4em] ${darkMode ? 'text-zinc-500' : 'text-white opacity-60'}`}>
            Portal Unificado de Eventos
          </p>
        </div>
        
        <div className="w-full max-w-sm flex flex-col items-center gap-4 z-10 pb-12 animate-in slide-in-from-bottom-8 duration-700">
          <button 
            onClick={() => changeView('SIGN_IN')} 
            className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${
              darkMode ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-primary'
            }`}
          >
            Acessar Plataforma
          </button>
          
          <button 
            onClick={onGuestLogin}
            className={`w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] border transition-all active:scale-95 ${
              darkMode ? 'border-white/10 text-zinc-500 hover:text-white' : 'border-white/20 text-white opacity-80'
            }`}
          >
            Entrar como Convidado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-zinc-950 flex flex-col p-8 overflow-y-auto no-scrollbar animate-in fade-in duration-500">
      <main className="w-full max-w-md mx-auto flex flex-col items-center pt-8 pb-12">
        <Logo size="lg" className="mb-12" />
        
        <div className="w-full text-center mb-10">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">
            {view === 'SIGN_IN' ? 'Portal de Acesso' : 'Novo Registro'}
          </h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-3">Rede Federal | IFAL</p>
        </div>

        {view === 'SIGN_IN' && (
          <div className="w-full mb-10 space-y-4">
            <button 
              type="button"
              onClick={handleSocialLogin}
              className="w-full h-16 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl border border-zinc-100 dark:border-white/5 active:scale-[0.98] transition-all group"
            >
              <span className="text-xs font-bold text-zinc-400">Entrar com</span>
              <div className="flex items-center font-black text-xl tracking-tighter">
                <span className="text-[#004b82] dark:text-[#60a5fa]">gov</span>
                <span className="text-[#32963b]">b</span>
                <span className="text-[#f8b133]">r</span>
              </div>
            </button>
            <div className="flex items-center gap-4 opacity-20">
              <div className="h-px flex-1 bg-zinc-400"></div>
              <span className="text-[9px] font-black uppercase tracking-widest">Acesso Local</span>
              <div className="h-px flex-1 bg-zinc-400"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="w-full space-y-4">
          {error && (
            <div className={`p-5 rounded-2xl animate-in shake duration-500 border-2 ${
              isNetworkIssue ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/20' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20'
            }`}>
              <p className={`text-[10px] font-black uppercase text-center leading-relaxed ${
                isNetworkIssue ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
              }`}>{error}</p>
              {isNetworkIssue && (
                <button 
                  type="button" 
                  onClick={onGuestLogin} 
                  className="mt-4 w-full h-12 bg-orange-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                >
                  Continuar em Modo Offline
                </button>
              )}
            </div>
          )}

          {message && (
            <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl animate-in zoom-in duration-300">
              <p className="text-[10px] font-black text-primary uppercase text-center">{message}</p>
            </div>
          )}

          <div className="space-y-4">
            {view === 'SIGN_UP' && (
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-14 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 text-sm font-bold dark:text-white outline-none transition-all placeholder:text-zinc-300" placeholder="Seu Nome Completo" />
            )}
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-14 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 text-sm font-bold dark:text-white outline-none transition-all placeholder:text-zinc-300" placeholder="E-mail Institucional" />
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full h-14 bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 text-sm font-bold dark:text-white outline-none transition-all placeholder:text-zinc-300" placeholder="Senha de Acesso" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest mt-6 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            ) : (
              view === 'SIGN_IN' ? 'Entrar no Sistema' : 'Criar Cadastro'
            )}
          </button>

          <div className="flex flex-col gap-6 mt-10 items-center">
            <button type="button" onClick={() => changeView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">
              {view === 'SIGN_IN' ? 'Não possui conta? Registre-se' : 'Já é cadastrado? Acesse aqui'}
            </button>
            <button type="button" onClick={() => changeView('LANDING')} className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] hover:text-zinc-500 transition-colors">Voltar</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
