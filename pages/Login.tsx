
import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import Logo from '../components/Logo.tsx';
import { CAMPUS_LIST } from '../constants.tsx';

interface LoginProps {
  onLogin: (demo?: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  errorMsg?: string | null;
}

type AuthView = 'LANDING' | 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

const Login: React.FC<LoginProps> = ({ onLogin, darkMode, errorMsg }) => {
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
      const errorText = handleSupabaseError(err);
      setError(errorText);
      // Sugestão automática de modo demo em caso de erro de rede
      if (errorText.toLowerCase().includes('rede') || errorText.toLowerCase().includes('servidor')) {
        setMessage("Dica: O servidor está offline. Você pode clicar em 'Acessar modo demonstração' para testar as telas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const enterDemo = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin(true);
      setLoading(false);
    }, 800);
  };

  const changeView = (newView: AuthView) => {
    setError(null);
    setMessage(null);
    setView(newView);
  };

  if (view === 'LANDING') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-between p-10 bg-zinc-950 transition-colors duration-700">
        <div className="h-12"></div>
        <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
          <Logo dark size="huge" className="mb-8 drop-shadow-2xl" />
          <p className="text-[11px] font-black px-8 uppercase tracking-[0.4em] text-zinc-500">
            Portal Unificado de Eventos
          </p>
        </div>
        
        <div className="w-full max-w-sm flex flex-col items-center gap-4 z-10 pb-12 animate-in slide-in-from-bottom-8 duration-700">
          <button 
            onClick={() => changeView('SIGN_IN')} 
            className="w-full h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em] bg-primary text-white shadow-2xl shadow-primary/20 transition-all active:scale-95"
          >
            Acessar Plataforma
          </button>
          
          <button 
            onClick={enterDemo}
            className="w-full h-16 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] bg-zinc-900 text-zinc-400 border border-white/5 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <div className="size-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div> : 'Modo Demonstração'}
          </button>
          
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-4">
            Uso restrito à comunidade acadêmica
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-8 overflow-y-auto no-scrollbar animate-in fade-in duration-500">
      <main className="w-full max-w-md mx-auto flex flex-col items-center pt-8 pb-12">
        <Logo dark size="lg" className="mb-12" />
        
        <div className="w-full text-center mb-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
            {view === 'SIGN_IN' ? 'Portal de Acesso' : 'Novo Registro'}
          </h1>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-3">Rede Federal | IFAL</p>
        </div>

        <form onSubmit={handleAuth} className="w-full space-y-4">
          {error && (
            <div className="p-5 rounded-2xl animate-in shake duration-500 border-2 bg-red-900/10 border-red-900/20">
              <p className="text-[10px] font-black uppercase text-center leading-relaxed text-red-400">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl animate-in zoom-in duration-300">
              <p className="text-[10px] font-black text-primary uppercase text-center leading-relaxed">{message}</p>
            </div>
          )}

          <div className="space-y-4">
            {view === 'SIGN_UP' && (
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-14 bg-zinc-900 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 text-sm font-bold text-white outline-none transition-all placeholder:text-zinc-600" placeholder="Seu Nome Completo" />
            )}
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-14 bg-zinc-900 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 text-sm font-bold text-white outline-none transition-all placeholder:text-zinc-600" placeholder="E-mail Institucional" />
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full h-14 bg-zinc-900 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 text-sm font-bold text-white outline-none transition-all placeholder:text-zinc-600" placeholder="Senha de Acesso" />
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
            <button type="button" onClick={enterDemo} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/20 pb-1">
              Testar em Modo Demonstração
            </button>
            <button type="button" onClick={() => changeView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-primary transition-colors">
              {view === 'SIGN_IN' ? 'Não possui conta? Registre-se' : 'Já é cadastrado? Acesse aqui'}
            </button>
            <button type="button" onClick={() => changeView('LANDING')} className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] hover:text-zinc-500 transition-colors">Voltar</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
