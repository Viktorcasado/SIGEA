
import React, { useState } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import { CAMPUS_LIST } from '../constants.tsx';

interface LoginProps {
  onLogin: () => void;
  onBack?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

type AuthView = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD' | 'CHECK_EMAIL';

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [view, setView] = useState<AuthView>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const siteUrl = `${window.location.origin}/reset-password`;

    try {
      if (view === 'SIGN_IN') {
        const { error: err } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        if (err) throw err;
        onLogin();
      } else if (view === 'SIGN_UP') {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { 
            data: { name, campus, role: 'PARTICIPANT' },
            emailRedirectTo: window.location.origin
          }
        });
        if (err) throw err;
        setView('CHECK_EMAIL');
      } else if (view === 'FORGOT_PASSWORD') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: siteUrl,
        });
        if (err) throw err;
        setView('CHECK_EMAIL');
      }
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // TELA: CHECK YOUR MAIL (Referência: Imagem 1, centro)
  if (view === 'CHECK_EMAIL') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-sm flex flex-col items-center text-center space-y-12">
          <div className="size-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-2 shadow-inner ring-1 ring-primary/20">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-[34px] font-black tracking-tight uppercase leading-none">Check your mail</h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight px-6">
              Enviamos as instruções de recuperação para o seu e-mail institucional.
            </p>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button 
              onClick={() => window.open('mailto:', '_blank')}
              className="w-full h-18 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all uppercase text-[11px] tracking-[0.2em]"
            >
              Open email app
            </button>
            <button 
              onClick={() => setView('SIGN_IN')}
              className="w-full py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              Skip, I'll confirm later
            </button>
          </div>

          <footer className="pt-20 text-[9px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-[0.3em] leading-loose">
            Did not receive the email? Check your spam, <br /> or <button onClick={() => setView('FORGOT_PASSWORD')} className="text-primary hover:underline">try another email address</button>
          </footer>
        </div>
      </div>
    );
  }

  // TELA: RESET PASSWORD / LOGIN (Referência: Imagem 1, esquerda)
  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in fade-in overflow-y-auto no-scrollbar">
      <header className="p-8 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => view === 'SIGN_IN' ? (onBack?.()) : setView('SIGN_IN')}
          className="size-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 active:scale-90 transition-all border border-zinc-100 dark:border-white/5"
        >
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <span className="material-symbols-outlined text-zinc-300 dark:text-zinc-800">help</span>
      </header>

      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm mx-auto w-full justify-center">
        <div className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-[44px] font-black tracking-tighter uppercase leading-none">
              {view === 'SIGN_IN' ? 'Login' : (view === 'SIGN_UP' ? 'Sign up' : 'Reset password')}
            </h1>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight max-w-[280px]">
              {view === 'FORGOT_PASSWORD' 
                ? 'Enter the email associated with your account and we\'ll send an email with instructions to reset your password.' 
                : 'Acesse o portal institucional SIGEA do IFAL para gerenciar seus eventos acadêmicos.'}
            </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-10">
            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center animate-in shake">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {view === 'SIGN_UP' && (
                <div className="space-y-2 relative group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all uppercase" />
                </div>
              )}

              <div className="space-y-2 relative group">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email address</label>
                <input required type="email" placeholder="mcraigw@outlook.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all lowercase placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />
              </div>
              
              {view !== 'FORGOT_PASSWORD' && (
                <div className="space-y-2 relative group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
                  <input required type="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all" />
                </div>
              )}
            </div>

            <button 
              disabled={loading} 
              className="w-full h-20 bg-primary text-white font-black rounded-Apple shadow-2xl shadow-primary/30 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                view === 'SIGN_IN' ? 'Entrar no Sistema' : (view === 'SIGN_UP' ? 'Create Account' : 'Send Instructions')
              )}
            </button>
          </form>

          {view === 'SIGN_IN' && (
            <div className="text-center">
              <button 
                onClick={() => setView('FORGOT_PASSWORD')}
                className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.1em] hover:text-primary transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          <footer className="text-center pt-10">
            <button 
              onClick={() => setView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} 
              className="text-[11px] font-black text-primary uppercase tracking-[0.15em]"
            >
              {view === 'SIGN_IN' ? 'Não possui acesso? Cadastre-se' : 'Já possui cadastro? Faça Login'}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Login;
